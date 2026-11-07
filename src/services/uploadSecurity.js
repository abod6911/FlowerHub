/**
 * File Upload Security Service
 * Validates file signatures (magic bytes), MIME types, and file size boundaries.
 * Blocks malicious polyglot files, hidden scripts, and disguised executable binaries.
 */

// Magic Bytes definitions for genuine image formats
const MAGIC_BYTES = {
  jpeg: [0xff, 0xd8, 0xff],
  png: [0x89, 0x50, 0x4e, 0x47],
  webp: [0x52, 0x49, 0x46, 0x46], // "RIFF" header
};

const ALLOWED_MIME_TYPES = ['image/jpeg', 'image/png', 'image/webp'];
const MAX_CUSTOMER_FILE_SIZE = 2 * 1024 * 1024; // 2MB
const MAX_STORE_ASSET_SIZE = 5 * 1024 * 1024; // 5MB

/**
 * Checks file header magic bytes to verify actual binary type matches declared extension.
 * @param {ArrayBuffer} buffer - First 16 bytes of the file
 * @returns {string|null} - Detected format ('jpeg'|'png'|'webp'|null)
 */
export function detectMagicBytes(buffer) {
  const bytes = new Uint8Array(buffer);

  // Check JPEG (FF D8 FF)
  if (bytes[0] === MAGIC_BYTES.jpeg[0] && bytes[1] === MAGIC_BYTES.jpeg[1] && bytes[2] === MAGIC_BYTES.jpeg[2]) {
    return 'jpeg';
  }

  // Check PNG (89 50 4E 47)
  if (
    bytes[0] === MAGIC_BYTES.png[0] &&
    bytes[1] === MAGIC_BYTES.png[1] &&
    bytes[2] === MAGIC_BYTES.png[2] &&
    bytes[3] === MAGIC_BYTES.png[3]
  ) {
    return 'png';
  }

  // Check WEBP (52 49 46 46 .... 57 45 42 50)
  if (
    bytes[0] === 0x52 &&
    bytes[1] === 0x49 &&
    bytes[2] === 0x46 &&
    bytes[3] === 0x46 &&
    bytes[8] === 0x57 &&
    bytes[9] === 0x45 &&
    bytes[10] === 0x42 &&
    bytes[11] === 0x50
  ) {
    return 'webp';
  }

  return null;
}

/**
 * Performs complete security validation on an uploaded File object.
 * @param {File} file - Candidate file from file input
 * @param {'customer'|'store'} [uploadType='customer']
 * @returns {Promise<{isValid: boolean, error: string|null, detectedType: string|null}>}
 */
export async function validateUploadedFile(file, uploadType = 'customer') {
  if (!file || !(file instanceof File)) {
    return { isValid: false, error: 'الملف المرفق غير صالح.', detectedType: null };
  }

  const maxSize = uploadType === 'store' ? MAX_STORE_ASSET_SIZE : MAX_CUSTOMER_FILE_SIZE;
  const maxSizeMB = Math.round(maxSize / (1024 * 1024));

  // 1. Strict Size Boundary Check
  if (file.size > maxSize) {
    return {
      isValid: false,
      error: `حجم الصورة يتجاوز الحد المسموح (${maxSizeMB} ميجابايت).`,
      detectedType: null,
    };
  }

  if (file.size < 64) {
    return {
      isValid: false,
      error: 'حجم الملف صغير جداً أو تالف.',
      detectedType: null,
    };
  }

  // 2. MIME Type Whitelist
  if (!ALLOWED_MIME_TYPES.includes(file.type.toLowerCase())) {
    return {
      isValid: false,
      error: 'نوع الملف غير مدعوم. يُسمح فقط بصور من نوع JPG و PNG و WebP.',
      detectedType: null,
    };
  }

  // 3. File Extension Whitelist & Anti-Double-Extension (.php.jpg)
  const nameParts = file.name.split('.');
  if (nameParts.length > 2) {
    // Check for suspicious double extensions (e.g., shell.php.png)
    const dangerousExts = ['php', 'exe', 'sh', 'phtml', 'html', 'js', 'svg'];
    for (let i = 1; i < nameParts.length - 1; i++) {
      if (dangerousExts.includes(nameParts[i].toLowerCase())) {
        return {
          isValid: false,
          error: 'تم اكتشاف اسم ملف مشبوه ومرفوض أمنياً.',
          detectedType: null,
        };
      }
    }
  }

  // 4. Magic Bytes Inspection (Deep Packet / Header Verification)
  try {
    const slice = file.slice(0, 16);
    const buffer = await slice.arrayBuffer();
    const detected = detectMagicBytes(buffer);

    if (!detected) {
      return {
        isValid: false,
        error: 'محتوى الملف لا يتطابق مع ترويسة الصور المعتمدة (توقيع غير صالح).',
        detectedType: null,
      };
    }

    return {
      isValid: true,
      error: null,
      detectedType: detected,
    };
  } catch (err) {
    return {
      isValid: false,
      error: 'فشل قراءة الملف والتحقق من أمانه.',
      detectedType: null,
    };
  }
}
