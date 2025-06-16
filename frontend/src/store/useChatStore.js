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
      toast.error(error.response.data.message);
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
      toast.error(error.response.data.message);
    } finally {
      set({ isMessagesLoading: false });
    }
  },
  
  sendMessage: async (messageData) => {
    const { selectedUser, messages } = get();
    const socket = useAuthStore.getState().socket;
  
    try {
      const encryptedText = encryptMessage(messageData.text);
  
      // Kirim via socket (realtime)
      socket.emit("sendMessage", {
        receiverId: selectedUser._id,
        encryptedMessage: encryptedText,
      });
  
      // Kirim via REST untuk disimpan (persisted)
      const res = await axiosInstance.post(`/messages/send/${selectedUser._id}`, {
        ...messageData,
        text: encryptedText,
      });
  
      // Tambahkan ke local state (tampilkan)
      set({ messages: [...messages, res.data] });
    } catch (error) {
      toast.error(error.response?.data?.message || "Gagal mengirim pesan");
    }
  },
  

  subscribeToMessages: () => {
    const { selectedUser } = get();
    if (!selectedUser) return;
  
    const socket = useAuthStore.getState().socket;
  
    socket.on("receiveMessage", (newMessage) => {
      const isMessageSentFromSelectedUser = newMessage.senderId === selectedUser._id;
      if (!isMessageSentFromSelectedUser) return;
  
      // ✅ DEKRIPSI di sini
      const decryptedText = decryptMessage(newMessage.encryptedMessage || newMessage.text);
      const cleanMessage = { ...newMessage, text: decryptedText };
  
      set({
        messages: [...get().messages, cleanMessage],
      });
    });
  },
  

  unsubscribeFromMessages: () => {
    const socket = useAuthStore.getState().socket;
    socket.off("newMessage");
  },

  setSelectedUser: (selectedUser) => set({ selectedUser }),
}));
