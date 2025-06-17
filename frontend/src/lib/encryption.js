// Encryption utility using CryptoJS for AES encryption/decryption
import CryptoJS from "crypto-js";

const SECRET_KEY = import.meta.env.VITE_CHAT_SECRET || "mySuperSecretKey";

export function encryptMessage(message) {
  return CryptoJS.AES.encrypt(message, SECRET_KEY).toString();
}

export function decryptMessage(cipherText) {
  try {
    if (!cipherText || typeof cipherText !== "string") return "";
    // Optional: hanya dekripsi jika format khas AES OpenSSL (mulai dengan "U2FsdGVkX1")
    if (!cipherText.startsWith("U2FsdGVkX1")) return cipherText;

    const bytes = CryptoJS.AES.decrypt(cipherText, SECRET_KEY);
    const decrypted = bytes.toString(CryptoJS.enc.Utf8);
    return decrypted || "[failed to decrypt]";
  } catch (e) {
    console.error("Failed to decrypt message:", e);
    return "[invalid encrypted data]";
  }
}
