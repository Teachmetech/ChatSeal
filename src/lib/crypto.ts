// Core encryption/decryption logic will go here
const IV_LENGTH = 12; // For AES-GCM

// Function to derive a key from a passphrase
export async function deriveKey(passphrase: string, salt: Uint8Array): Promise<CryptoKey> {
  const keyMaterial = await window.crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(passphrase),
    { name: "PBKDF2" },
    false,
    ["deriveKey"]
  );
  return window.crypto.subtle.deriveKey(
    {
      name: "PBKDF2",
      salt: salt,
      iterations: 100000,
      hash: "SHA-256",
    },
    keyMaterial,
    { name: "AES-GCM", length: 256 },
    true,
    ["encrypt", "decrypt"]
  );
}

// Encrypt data
export async function encryptData(key: CryptoKey, data: ArrayBuffer): Promise<{ ciphertext: ArrayBuffer, iv: Uint8Array }> {
  const iv = window.crypto.getRandomValues(new Uint8Array(IV_LENGTH));
  const ciphertext = await window.crypto.subtle.encrypt(
    {
      name: "AES-GCM",
      iv: iv,
    },
    key,
    data
  );
  return { ciphertext, iv };
}

// Decrypt data
export async function decryptData(key: CryptoKey, ciphertext: ArrayBuffer, iv: Uint8Array): Promise<ArrayBuffer> {
  return window.crypto.subtle.decrypt(
    {
      name: "AES-GCM",
      iv: iv,
    },
    key,
    ciphertext
  );
}
