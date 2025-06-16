import CryptoJS from "crypto-js";

const SECRET_KEY = import.meta.env.VITE_CHAT_SECRET || "mySuperSecretKey";

export function encryptMessage(message) {
  return CryptoJS.AES.encrypt(message, SECRET_KEY).toString();
}

export function decryptMessage(cipherText) {
  return CryptoJS.AES.decrypt(cipherText, SECRET_KEY).toString(CryptoJS.enc.Utf8);
}
