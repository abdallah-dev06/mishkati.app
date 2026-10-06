/**
 * imageUtils.ts
 * Client-side utilities for image compression, validation, Base64 conversion,
 * and multimodal attachment extraction for Siraj AI Vision Assistant.
 */

export interface ImageAttachment {
  id: string;
  file: File;
  previewUrl: string;
  base64Data: string;
  mimeType: string;
  name: string;
  size: number;
}

export const MAX_IMAGE_FILE_SIZE_BYTES = 5 * 1024 * 1024; // 5 MB
export const MAX_IMAGES_PER_PROMPT = 3;
export const ALLOWED_IMAGE_MIME_TYPES = [
  'image/png',
  'image/jpeg',
  'image/jpg',
  'image/webp'
];

/**
 * Validates an image file by MIME type and size.
 */
export function validateImageFile(file: File): { valid: boolean; error?: string } {
  if (!ALLOWED_IMAGE_MIME_TYPES.includes(file.type.toLowerCase())) {
    return {
      valid: false,
      error: 'نوع الملف غير مدعوم. يرجى اختيار صورة بصيغة PNG أو JPG أو WEBP.'
    };
  }

  if (file.size > MAX_IMAGE_FILE_SIZE_BYTES) {
    const sizeMb = (file.size / (1024 * 1024)).toFixed(1);
    return {
      valid: false,
      error: `حجم الصورة كبير جداً (${sizeMb} ميجابايت). الحد الأقصى المسموح به هو 5 ميجابايت.`
    };
  }

  return { valid: true };
}

/**
 * Strips data URL prefix and returns raw Base64 string for Gemini API.
 */
export function stripBase64Prefix(dataUrl: string): string {
  const commaIndex = dataUrl.indexOf(',');
  return commaIndex !== -1 ? dataUrl.slice(commaIndex + 1) : dataUrl;
}

/**
 * Compresses and resizes an image file client-side to save bandwidth and API tokens.
 */
export async function compressAndProcessImage(
  file: File,
  maxWidth = 1600,
  maxHeight = 1600,
  quality = 0.85
): Promise<ImageAttachment> {
  const validation = validateImageFile(file);
  if (!validation.valid) {
    throw new Error(validation.error);
  }

  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onerror = () => {
      reject(new Error('فشل قراءة ملف الصورة.'));
    };

    reader.onload = (e) => {
      const img = new Image();
      img.onerror = () => {
        reject(new Error('فشل معالجة محتوى الصورة.'));
      };

      img.onload = () => {
        try {
          let { width, height } = img;

          // Resize if exceeding max dimensions while maintaining aspect ratio
          if (width > maxWidth || height > maxHeight) {
            const ratio = Math.min(maxWidth / width, maxHeight / height);
            width = Math.round(width * ratio);
            height = Math.round(height * ratio);
          }

          const canvas = document.createElement('canvas');
          canvas.width = width;
          canvas.height = height;

          const ctx = canvas.getContext('2d');
          if (!ctx) {
            // Fallback: return uncompressed
            const rawDataUrl = e.target?.result as string;
            resolve({
              id: `img_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
              file,
              previewUrl: rawDataUrl,
              base64Data: stripBase64Prefix(rawDataUrl),
              mimeType: file.type,
              name: file.name,
              size: file.size
            });
            return;
          }

          // Draw image smoothly on canvas
          ctx.imageSmoothingEnabled = true;
          ctx.imageSmoothingQuality = 'high';
          ctx.drawImage(img, 0, 0, width, height);

          // Export as JPEG/WEBP
          const outputMime = file.type === 'image/png' ? 'image/png' : 'image/jpeg';
          const compressedDataUrl = canvas.toDataURL(outputMime, quality);
          const rawBase64 = stripBase64Prefix(compressedDataUrl);

          resolve({
            id: `img_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
            file,
            previewUrl: compressedDataUrl,
            base64Data: rawBase64,
            mimeType: outputMime,
            name: file.name,
            size: Math.round((rawBase64.length * 3) / 4)
          });
        } catch (err) {
          reject(err);
        }
      };

      img.src = e.target?.result as string;
    };

    reader.readAsDataURL(file);
  });
}

/**
 * Extracts image files from clipboard paste event.
 */
export function extractImagesFromClipboard(event: ClipboardEvent | React.ClipboardEvent): File[] {
  const files: File[] = [];
  const items = event.clipboardData?.items;
  if (!items) return files;

  for (let i = 0; i < items.length; i++) {
    const item = items[i];
    if (item.type.indexOf('image') !== -1) {
      const blob = item.getAsFile();
      if (blob) {
        // Name screenshot appropriately if unnamed
        const fileName = blob.name || `screenshot_${Date.now()}.png`;
        const namedFile = new File([blob], fileName, { type: blob.type });
        files.push(namedFile);
      }
    }
  }

  return files;
}

/**
 * Extracts image files from drag and drop event.
 */
export function extractImagesFromDataTransfer(event: DragEvent | React.DragEvent): File[] {
  const files: File[] = [];
  const dt = event.dataTransfer;
  if (!dt) return files;

  if (dt.files && dt.files.length > 0) {
    for (let i = 0; i < dt.files.length; i++) {
      const f = dt.files[i];
      if (f.type.startsWith('image/')) {
        files.push(f);
      }
    }
  }

  return files;
}
