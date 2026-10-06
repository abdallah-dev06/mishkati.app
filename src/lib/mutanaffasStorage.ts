/**
 * مُتَنَفَّس (Mutanaffas) - Zero-Knowledge Client-Side Storage & Web Crypto Utility
 * 
 * STRICT PRIVACY DIRECTIVE:
 * - 100% Local / Zero Server Exposure: All data strictly remains on the user's device.
 * - No network requests or tracking.
 * - Web Crypto API (AES-GCM 256-bit with PBKDF2 100,000 iterations) for military-grade local encryption.
 */

export interface MutanaffasEntry {
  id: string;
  createdAt: string;
  updatedAt: string;
  mood?: string;
  title?: string;
  content: string;
  isEncrypted: boolean;
  encryptedData?: string;
}

export interface StoredEntryPayload {
  id: string;
  createdAt: string;
  updatedAt: string;
  mood?: string;
  title?: string;
  isEncrypted: boolean;
  content?: string; // Only present if unencrypted
  encryptedData?: string; // Base64 payload if encrypted
}

const STORAGE_KEY = 'mishkati_mutanaffas_entries_v1';
const PIN_HASH_KEY = 'mishkati_mutanaffas_pin_hash';
const PIN_SALT_KEY = 'mishkati_mutanaffas_pin_salt';

// Helper: Convert ArrayBuffer to Base64
function arrayBufferToBase64(buffer: ArrayBuffer): string {
  let binary = '';
  const bytes = new Uint8Array(buffer);
  const len = bytes.byteLength;
  for (let i = 0; i < len; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary);
}

// Helper: Convert Base64 to Uint8Array
function base64ToUint8Array(base64: string): Uint8Array {
  const binary = atob(base64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i);
  }
  return bytes;
}

// Derive AES-GCM Key from user PIN + salt via PBKDF2
async function deriveKey(pin: string, salt: Uint8Array): Promise<CryptoKey> {
  const enc = new TextEncoder();
  const keyMaterial = await crypto.subtle.importKey(
    'raw',
    enc.encode(pin),
    { name: 'PBKDF2' },
    false,
    ['deriveKey']
  );

  return crypto.subtle.deriveKey(
    {
      name: 'PBKDF2',
      salt: salt,
      iterations: 100000,
      hash: 'SHA-256'
    },
    keyMaterial,
    { name: 'AES-GCM', length: 256 },
    false,
    ['encrypt', 'decrypt']
  );
}

// Encrypt plaintext with AES-GCM
export async function encryptText(plainText: string, pin: string): Promise<string> {
  if (typeof window === 'undefined' || !window.crypto || !window.crypto.subtle) {
    throw new Error('Web Crypto API غير مدعوم في هذا المتصفح');
  }

  const enc = new TextEncoder();
  const salt = crypto.getRandomValues(new Uint8Array(16));
  const iv = crypto.getRandomValues(new Uint8Array(12));
  const key = await deriveKey(pin, salt);

  const ciphertext = await crypto.subtle.encrypt(
    { name: 'AES-GCM', iv: iv },
    key,
    enc.encode(plainText)
  );

  const packageObj = {
    salt: arrayBufferToBase64(salt.buffer),
    iv: arrayBufferToBase64(iv.buffer),
    data: arrayBufferToBase64(ciphertext)
  };

  return JSON.stringify(packageObj);
}

// Decrypt ciphertext with AES-GCM
export async function decryptText(encryptedJson: string, pin: string): Promise<string> {
  if (typeof window === 'undefined' || !window.crypto || !window.crypto.subtle) {
    throw new Error('Web Crypto API غير مدعوم في هذا المتصفح');
  }

  try {
    const parsed = JSON.parse(encryptedJson);
    const salt = base64ToUint8Array(parsed.salt);
    const iv = base64ToUint8Array(parsed.iv);
    const ciphertext = base64ToUint8Array(parsed.data);

    const key = await deriveKey(pin, salt);
    const decryptedBuffer = await crypto.subtle.decrypt(
      { name: 'AES-GCM', iv: iv },
      key,
      ciphertext
    );

    const dec = new TextDecoder();
    return dec.decode(decryptedBuffer);
  } catch (err) {
    throw new Error('رمز الدخول (PIN) غير صحيح أو البيانات تالفة');
  }
}

// Check if a PIN is set
export function isPinProtected(): boolean {
  if (typeof window === 'undefined') return false;
  return !!localStorage.getItem(PIN_HASH_KEY);
}

// Set or update PIN
export async function setPasscode(pin: string): Promise<void> {
  if (typeof window === 'undefined') return;
  const enc = new TextEncoder();
  const salt = crypto.getRandomValues(new Uint8Array(16));
  const saltBase64 = arrayBufferToBase64(salt.buffer);

  // Hash PIN + salt for storage verification
  const saltedPin = enc.encode(pin + saltBase64);
  const hashBuffer = await crypto.subtle.digest('SHA-256', saltedPin);
  const hashBase64 = arrayBufferToBase64(hashBuffer);

  localStorage.setItem(PIN_SALT_KEY, saltBase64);
  localStorage.setItem(PIN_HASH_KEY, hashBase64);
}

// Verify entered PIN
export async function verifyPasscode(pin: string): Promise<boolean> {
  if (typeof window === 'undefined') return false;
  const saltBase64 = localStorage.getItem(PIN_SALT_KEY);
  const storedHash = localStorage.getItem(PIN_HASH_KEY);

  if (!saltBase64 || !storedHash) return true; // No PIN set

  const enc = new TextEncoder();
  const saltedPin = enc.encode(pin + saltBase64);
  const hashBuffer = await crypto.subtle.digest('SHA-256', saltedPin);
  const hashBase64 = arrayBufferToBase64(hashBuffer);

  return hashBase64 === storedHash;
}

// Remove PIN (and unprotect storage)
export function removePasscode(): void {
  if (typeof window === 'undefined') return;
  localStorage.removeItem(PIN_HASH_KEY);
  localStorage.removeItem(PIN_SALT_KEY);
}

// Get all raw stored entries
function getRawEntries(): StoredEntryPayload[] {
  if (typeof window === 'undefined') return [];
  const raw = localStorage.getItem(STORAGE_KEY);
  if (!raw) return [];
  try {
    return JSON.parse(raw);
  } catch (e) {
    return [];
  }
}

// Save raw entries to local storage
function saveRawEntries(entries: StoredEntryPayload[]): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(entries));
}

// Load and decrypt all entries
export async function loadEntries(pin?: string): Promise<MutanaffasEntry[]> {
  const rawEntries = getRawEntries();
  const result: MutanaffasEntry[] = [];

  for (const raw of rawEntries) {
    if (raw.isEncrypted && raw.encryptedData) {
      if (!pin) {
        // Return locked placeholder
        result.push({
          id: raw.id,
          createdAt: raw.createdAt,
          updatedAt: raw.updatedAt,
          mood: raw.mood,
          title: raw.title || 'خاطرة مشفرة',
          content: '🔒 هذه الخاطرة مشفرة بكلمة المرور الخاصة بك.',
          isEncrypted: true,
          encryptedData: raw.encryptedData
        });
      } else {
        try {
          const decrypted = await decryptText(raw.encryptedData, pin);
          result.push({
            id: raw.id,
            createdAt: raw.createdAt,
            updatedAt: raw.updatedAt,
            mood: raw.mood,
            title: raw.title,
            content: decrypted,
            isEncrypted: true,
            encryptedData: raw.encryptedData
          });
        } catch (e) {
          result.push({
            id: raw.id,
            createdAt: raw.createdAt,
            updatedAt: raw.updatedAt,
            mood: raw.mood,
            title: raw.title || 'خاطرة مشفرة',
            content: '⚠️ تعذر فك تشفير الخاطرة بهذا الرمز.',
            isEncrypted: true,
            encryptedData: raw.encryptedData
          });
        }
      }
    } else {
      result.push({
        id: raw.id,
        createdAt: raw.createdAt,
        updatedAt: raw.updatedAt,
        mood: raw.mood,
        title: raw.title,
        content: raw.content || '',
        isEncrypted: false
      });
    }
  }

  // Sort newest first
  return result.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
}

// Save a new entry
export async function addEntry(
  entryData: { title?: string; content: string; mood?: string },
  pin?: string
): Promise<MutanaffasEntry> {
  const rawList = getRawEntries();
  const id = 'mut_' + Date.now() + '_' + Math.random().toString(36).substring(2, 7);
  const now = new Date().toISOString();

  let payload: StoredEntryPayload;

  if (pin && pin.trim()) {
    const encryptedData = await encryptText(entryData.content, pin.trim());
    payload = {
      id,
      createdAt: now,
      updatedAt: now,
      mood: entryData.mood,
      title: entryData.title,
      isEncrypted: true,
      encryptedData
    };
  } else {
    payload = {
      id,
      createdAt: now,
      updatedAt: now,
      mood: entryData.mood,
      title: entryData.title,
      isEncrypted: false,
      content: entryData.content
    };
  }

  rawList.unshift(payload);
  saveRawEntries(rawList);

  return {
    id,
    createdAt: now,
    updatedAt: now,
    mood: entryData.mood,
    title: entryData.title,
    content: entryData.content,
    isEncrypted: !!pin,
    encryptedData: payload.encryptedData
  };
}

// Update existing entry
export async function updateEntry(
  id: string,
  updates: { title?: string; content?: string; mood?: string },
  pin?: string
): Promise<void> {
  const rawList = getRawEntries();
  const index = rawList.findIndex((e) => e.id === id);
  if (index === -1) return;

  const current = rawList[index];
  const now = new Date().toISOString();

  if (updates.mood !== undefined) current.mood = updates.mood;
  if (updates.title !== undefined) current.title = updates.title;
  current.updatedAt = now;

  if (updates.content !== undefined) {
    if (pin && pin.trim()) {
      current.isEncrypted = true;
      current.encryptedData = await encryptText(updates.content, pin.trim());
      delete current.content;
    } else {
      current.isEncrypted = false;
      current.content = updates.content;
      delete current.encryptedData;
    }
  }

  rawList[index] = current;
  saveRawEntries(rawList);
}

// Permanently destroy entry (Zero-Trace Wipe)
export function deleteEntry(id: string): void {
  const rawList = getRawEntries();
  const filtered = rawList.filter((e) => e.id !== id);
  saveRawEntries(filtered);
}

// Export archive as JSON or plain TXT
export async function exportArchive(pin?: string, format: 'json' | 'txt' = 'txt'): Promise<string> {
  const entries = await loadEntries(pin);

  if (format === 'json') {
    return JSON.stringify(entries, null, 2);
  }

  let textContent = `=================================================\n`;
  textContent += ` أرشيف «مُتَنَفَّس» الشخصي - مِشكاتي\n`;
  textContent += ` تاريخ التصدير: ${new Date().toLocaleString('ar-PS')}\n`;
  textContent += ` تنبيه: هذا الملف شخصي وسري للغاية\n`;
  textContent += `=================================================\n\n`;

  for (const entry of entries) {
    textContent += `📅 التاريخ: ${new Date(entry.createdAt).toLocaleDateString('ar-PS')} (${new Date(entry.createdAt).toLocaleTimeString('ar-PS')})\n`;
    if (entry.mood) textContent += `🏷️ الحالة: ${entry.mood}\n`;
    if (entry.title) textContent += `📌 العنوان: ${entry.title}\n`;
    textContent += `\n${entry.content}\n\n`;
    textContent += `-------------------------------------------------\n\n`;
  }

  return textContent;
}
