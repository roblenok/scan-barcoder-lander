
import CryptoJS from 'crypto-js';

const STORAGE_KEY = 'lamp_scanner_endpoints';
const DEFAULT_PASSWORD = 'lamp_scanner_secure_2024'; // Default encryption key

export interface EncryptedEndpoint {
  id: string;
  name: string;
  url: string;
  method: 'GET' | 'POST' | 'CURL';
  enabled: boolean;
}

export const encryptData = (data: any, password: string = DEFAULT_PASSWORD): string => {
  try {
    const jsonString = JSON.stringify(data);
    const encrypted = CryptoJS.AES.encrypt(jsonString, password).toString();
    return encrypted;
  } catch (error) {
    console.error('Encryption error:', error);
    throw new Error('Failed to encrypt data');
  }
};

export const decryptData = (encryptedData: string, password: string = DEFAULT_PASSWORD): any => {
  try {
    const decrypted = CryptoJS.AES.decrypt(encryptedData, password);
    const jsonString = decrypted.toString(CryptoJS.enc.Utf8);
    return JSON.parse(jsonString);
  } catch (error) {
    console.error('Decryption error:', error);
    throw new Error('Failed to decrypt data');
  }
};

export const saveEncryptedEndpoints = (endpoints: EncryptedEndpoint[], password?: string): void => {
  try {
    const encrypted = encryptData(endpoints, password);
    localStorage.setItem(STORAGE_KEY, encrypted);
  } catch (error) {
    console.error('Error saving encrypted endpoints:', error);
    throw new Error('Failed to save endpoints');
  }
};

export const loadEncryptedEndpoints = (password?: string): EncryptedEndpoint[] => {
  try {
    const encrypted = localStorage.getItem(STORAGE_KEY);
    if (!encrypted) {
      return [];
    }
    
    const decrypted = decryptData(encrypted, password);
    return Array.isArray(decrypted) ? decrypted : [];
  } catch (error) {
    console.error('Error loading encrypted endpoints:', error);
    // Return empty array if decryption fails (wrong password or corrupted data)
    return [];
  }
};

export const clearEncryptedEndpoints = (): void => {
  localStorage.removeItem(STORAGE_KEY);
};
