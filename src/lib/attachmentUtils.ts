/**
 * attachmentUtils.ts
 * Omnichannel attachment types and processing helpers for Siraj AI Assistant:
 * - Images & Screenshots
 * - Live Camera Captures
 * - Educational Documents (PDF, PPTX, DOCX, TXT)
 * - External Web & Article Links
 */

import {
  compressAndProcessImage,
  stripBase64Prefix,
  ALLOWED_IMAGE_MIME_TYPES,
  MAX_IMAGE_FILE_SIZE_BYTES
} from './imageUtils';

export type AttachmentType = 'image' | 'camera' | 'document' | 'link';

export interface SirajAttachment {
  id: string;
  type: AttachmentType;
  name: string;
  size?: number;
  previewUrl?: string; // For images, camera captures
  mimeType?: string;
  base64Data?: string; // For images and PDFs
  textContent?: string; // For TXT/parsed docs
  url?: string; // For external links
  domain?: string; // For external links
}

export const MAX_TOTAL_ATTACHMENTS = 4;
export const MAX_DOC_FILE_SIZE_BYTES = 10 * 1024 * 1024; // 10 MB

export const ALLOWED_DOC_EXTENSIONS = ['.pdf', '.pptx', '.docx', '.txt'];

export const ALLOWED_DOC_MIME_TYPES = [
  'application/pdf',
  'text/plain',
  'application/vnd.openxmlformats-officedocument.presentationml.presentation',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
];

/**
 * Formats byte size into human readable Arabic string (كيلوبايت / ميجابايت).
 */
export function formatAttachmentSize(bytes?: number): string {
  if (!bytes || bytes <= 0) return '';
  if (bytes < 1024) return `${bytes} بايت`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} ك.ب`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} م.ب`;
}

/**
 * Extracts clean domain name from a URL.
 */
export function extractDomainFromUrl(rawUrl: string): string {
  try {
    let normalized = rawUrl.trim();
    if (!normalized.startsWith('http://') && !normalized.startsWith('https://')) {
      normalized = 'https://' + normalized;
    }
    const parsed = new URL(normalized);
    return parsed.hostname.replace(/^www\./, '');
  } catch {
    return 'رابط خارجي';
  }
}

/**
 * Validates and normalizes web link URL.
 */
export function validateAndNormalizeUrl(rawUrl: string): { valid: boolean; normalizedUrl?: string; error?: string } {
  let trimmed = rawUrl.trim();
  if (!trimmed) {
    return { valid: false, error: 'يرجى إدخال رابط صالح' };
  }
  if (!trimmed.startsWith('http://') && !trimmed.startsWith('https://')) {
    trimmed = 'https://' + trimmed;
  }
  try {
    const urlObj = new URL(trimmed);
    if (!urlObj.hostname.includes('.')) {
      return { valid: false, error: 'عنوان الرابط غير صحيح أو غير مكتمل' };
    }
    return { valid: true, normalizedUrl: urlObj.href };
  } catch {
    return { valid: false, error: 'عنوان الرابط غير صالح' };
  }
}

/**
 * Processes an uploaded image file with compression.
 */
export async function processImageFileAttachment(file: File): Promise<SirajAttachment> {
  const processed = await compressAndProcessImage(file);
  return {
    id: processed.id,
    type: 'image',
    name: processed.name,
    size: processed.size,
    previewUrl: processed.previewUrl,
    base64Data: processed.base64Data,
    mimeType: processed.mimeType
  };
}

/**
 * Processes a direct camera snapshot from Canvas data URL.
 */
export function processCameraSnapshotAttachment(dataUrl: string): SirajAttachment {
  const base64Data = stripBase64Prefix(dataUrl);
  return {
    id: `cam_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
    type: 'camera',
    name: `لقطة_كاميرا_${new Date().toLocaleTimeString('ar-PS', { hour: '2-digit', minute: '2-digit' })}.jpg`,
    size: Math.round((base64Data.length * 3) / 4),
    previewUrl: dataUrl,
    base64Data,
    mimeType: 'image/jpeg'
  };
}

/**
 * Processes an educational document file (PDF, TXT, PPTX, DOCX).
 */
export async function processDocumentFileAttachment(file: File): Promise<SirajAttachment> {
  const lowerName = file.name.toLowerCase();
  const ext = lowerName.slice(lowerName.lastIndexOf('.'));

  if (!ALLOWED_DOC_EXTENSIONS.includes(ext)) {
    throw new Error('نوع المستند غير مدعوم. الصيغ المدعومة هي: PDF, PPTX, DOCX, TXT');
  }

  if (file.size > MAX_DOC_FILE_SIZE_BYTES) {
    const mb = (file.size / (1024 * 1024)).toFixed(1);
    throw new Error(`حجم المستند كبير جداً (${mb} م.ب). الحد الأقصى المسموح به هو 10 ميجابايت.`);
  }

  // If text file, read text content directly
  if (ext === '.txt' || file.type === 'text/plain') {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onerror = () => reject(new Error('فشل قراءة الملف النصي'));
      reader.onload = () => {
        const text = (reader.result as string) || '';
        resolve({
          id: `doc_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
          type: 'document',
          name: file.name,
          size: file.size,
          mimeType: 'text/plain',
          textContent: text
        });
      };
      reader.readAsText(file);
    });
  }

  // If PDF file, read as base64 (Gemini multimodal handles application/pdf directly)
  if (ext === '.pdf' || file.type === 'application/pdf') {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onerror = () => reject(new Error('فشل قراءة ملف PDF'));
      reader.onload = () => {
        const dataUrl = reader.result as string;
        resolve({
          id: `doc_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
          type: 'document',
          name: file.name,
          size: file.size,
          mimeType: 'application/pdf',
          base64Data: stripBase64Prefix(dataUrl)
        });
      };
      reader.readAsDataURL(file);
    });
  }

  // For Office docs (DOCX, PPTX), record reference metadata
  return {
    id: `doc_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
    type: 'document',
    name: file.name,
    size: file.size,
    mimeType: file.type || 'application/octet-stream',
    textContent: `[مستند دراسي مرفق: ${file.name}]`
  };
}

/**
 * Creates an external link attachment.
 */
export function createLinkAttachment(url: string, customTitle?: string): SirajAttachment {
  const norm = validateAndNormalizeUrl(url);
  const targetUrl = norm.valid && norm.normalizedUrl ? norm.normalizedUrl : url;
  const domain = extractDomainFromUrl(targetUrl);
  return {
    id: `lnk_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
    type: 'link',
    name: customTitle || domain,
    url: targetUrl,
    domain
  };
}

/**
 * Builds unified context string & Gemini inlineData parts for multimodal request.
 */
export function buildMultimodalPayloadParts(
  userText: string,
  attachments: SirajAttachment[]
): {
  unifiedText: string;
  inlineParts: Array<{ inlineData: { mimeType: string; data: string } }>;
} {
  let contextAdditions = '';
  const inlineParts: Array<{ inlineData: { mimeType: string; data: string } }> = [];

  for (const att of attachments) {
    if ((att.type === 'image' || att.type === 'camera') && att.base64Data && att.mimeType) {
      inlineParts.push({
        inlineData: {
          mimeType: att.mimeType,
          data: att.base64Data
        }
      });
    } else if (att.type === 'document') {
      if (att.mimeType === 'application/pdf' && att.base64Data) {
        inlineParts.push({
          inlineData: {
            mimeType: 'application/pdf',
            data: att.base64Data
          }
        });
      } else if (att.textContent) {
        contextAdditions += `\n\n--- محتوى المستند المرفق (${att.name}) ---\n${att.textContent.slice(0, 8000)}\n--- نهاية المستند ---`;
      }
    } else if (att.type === 'link' && att.url) {
      contextAdditions += `\n\n--- رابط مرجع خارجي مرفق ---\nالرابط: ${att.url}\nالنطاق: ${att.domain || ''}\n--- نهاية الرابط ---`;
    }
  }

  const unifiedText = (userText + contextAdditions).trim();
  return { unifiedText, inlineParts };
}
