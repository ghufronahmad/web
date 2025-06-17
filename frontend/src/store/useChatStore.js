// File to manage chat-related state using Zustand
import { create } from "zustand";
import toast from "react-hot-toast";
import { axiosInstance } from "../lib/axios";
import { useAuthStore } from "./useAuthStore";
import { encryptMessage, decryptMessage } from "../lib/encryption";

export const useChatStore = create((set, get) => ({
  messages: [],
  users: [],
  selectedUser: null,
  isUsersLoading: false,
  isMessagesLoading: false,

  getUsers: async () => {
    set({ isUsersLoading: true });
    try {
      const res = await axiosInstance.get("/messages/users");
      set({ users: res.data });
    } catch (error) {
      toast.error(error?.response?.data?.message || "Gagal memuat pengguna");
    } finally {
      set({ isUsersLoading: false });
    }
  },

  getMessages: async (userId) => {
    set({ isMessagesLoading: true });
    try {
      const res = await axiosInstance.get(`/messages/${userId}`);
      
      const decryptedMessages = res.data.map((msg) => ({
        ...msg,
        text: decryptMessage(msg.text),
      }));
  
      set({ messages: decryptedMessages });
    } catch (error) {
      console.error("getMessages error", error);
      toast.error(error?.response?.data?.message || "Gagal memuat pesan");
    } finally {
      set({ isMessagesLoading: false });
    }
  },

  sendMessage: async (messageData) => {
    const { selectedUser } = get();
    const socket = useAuthStore.getState().socket;

    try {
      const encryptedText = encryptMessage(messageData.text);

      // Kirim lewat socket
      socket.emit("sendMessage", {
        receiverId: selectedUser._id,
        encryptedMessage: encryptedText,
      });

      // Simpan lewat REST API
      const res = await axiosInstance.post(`/messages/send/${selectedUser._id}`, {
        ...messageData,
        text: encryptedText,
      });

      // Tambahkan ke state lokal dengan dekripsi
      const decryptedText = decryptMessage(res.data.text);
      set((state) => ({
        messages: [...state.messages, { ...res.data, text: decryptedText }],
      }));
    } catch (error) {
      toast.error(error?.response?.data?.message || "Gagal mengirim pesan");
    }
  },

  subscribeToMessages: () => {
    const { selectedUser } = get();
    if (!selectedUser) return;

    const socket = useAuthStore.getState().socket;

    // Hindari listener ganda
    socket.off("receiveMessage");

    socket.on("receiveMessage", (newMessage) => {
      const isMessageFromSelectedUser = newMessage.senderId === selectedUser._id;
      if (!isMessageFromSelectedUser) return;

      const decryptedText = decryptMessage(newMessage.encryptedMessage || newMessage.text);
      const cleanMessage = { ...newMessage, text: decryptedText };

      set((state) => ({
        messages: [...state.messages, cleanMessage],
      }));
    });
  },

  unsubscribeFromMessages: () => {
    const socket = useAuthStore.getState().socket;
    socket.off("receiveMessage");
  },

  setSelectedUser: (selectedUser) => set({ selectedUser }),
}));
