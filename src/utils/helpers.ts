// src/utils/helpers.ts
import DOMPurify from 'dompurify'
import { marked } from 'marked'
import { format, formatDistance } from 'date-fns'
/**
 * Converts a Float32Array buffer (Web Audio API format, -1.0 to 1.0)
 * to a 16-bit PCM Uint8Array (little-endian).
 */
export function float32ToPCM (input: Float32Array): Uint8Array {
  const buffer = new ArrayBuffer(input.length * 2); // 2 bytes per sample (16-bit)
  const view = new DataView(buffer);
  for (let i = 0; i < input.length; i++) {
    const s = Math.max(-1, Math.min(1, input[i]));
    const intValue = s < 0 ? s * 0x8000 : s * 0x7FFF;
    view.setInt16(i * 2, intValue, true);
  }
  return new Uint8Array(buffer);
}

/**
 * Converts an ArrayBuffer to a Base64 string.
 */
export function arrayBufferToBase64 (buffer: ArrayBuffer): string {
  let binary = '';
  const bytes = new Uint8Array(buffer);
  const len = bytes.byteLength;
  for (let i = 0; i < len; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return window.btoa(binary);
}

/**
 * Converts a Base64 string to a Uint8Array.
 * Handles standard and URL-safe Base64 variations (replace -_ with +/).
 */
export function base64ToUint8Array (base64: string): Uint8Array {
  // Replace URL safe chars if present
  const base64Standard = base64.replace(/-/g, '+').replace(/_/g, '/');
  // Pad if necessary
  const padding = '='.repeat((4 - base64Standard.length % 4) % 4);
  const base64Padded = base64Standard + padding;

  try {
    const binary_string = window.atob(base64Padded);
    const len = binary_string.length;
    const bytes = new Uint8Array(len);
    for (let i = 0; i < len; i++) {
      bytes[i] = binary_string.charCodeAt(i);
    }
    return bytes;
  } catch (e) {
    console.error('Base64 decoding failed:', e);
    // Handle error appropriately, maybe return an empty array or throw
    return new Uint8Array(0);
  }
}

export function parseSampleRate (mimeType: string | undefined): number | null {
  if (!mimeType) return null;
  const match = mimeType.match(/rate=(\d+)/);
  if (match && match[1]) {
    const rate = parseInt(match[1], 10);
    return isNaN(rate) ? null : rate;
  }
  // Default or fallback if rate not specified (though it should be for PCM)
  // You might return a default like 16000 or null to indicate unknown
  console.warn(`Could not parse sample rate from mimeType: ${mimeType}. Defaulting may cause issues.`);
  return null; // Or return a default like 16000, but 24000 was seen
}

// Generate a unique ID for messages and sessions
export function generateId (): string {
  return Date.now().toString(36) + Math.random().toString(36).substring(2)
}

// Format dates
export function formatDate (date: string | Date, formatStr = 'PP'): string {
  return format(new Date(date), formatStr)
}

// Format relative time (e.g., "5 minutes ago")
export function formatRelativeTime (date: string | Date): string {
  return formatDistance(new Date(date), new Date(), { addSuffix: true })
}

// Safely render markdown content
export function renderMarkdown (content: string): string {
  const rawHtml = marked(content, { async: false }) as string
  return DOMPurify.sanitize(rawHtml)
}

// Format file size
export function formatFileSize (bytes: number): string {
  if (bytes === 0) return '0 Bytes'

  const k = 1024
  const sizes = ['Bytes', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))

  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
}

// Truncate text with ellipsis
export function truncateText (text: string, maxLength = 50): string {
  if (text.length <= maxLength) return text
  return text.substring(0, maxLength) + '...'
}

// Debounce function
export function debounce<T extends (...args: any[]) => any> (
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: ReturnType<typeof setTimeout> | null = null

  return (...args: Parameters<T>) => {
    if (timeout) clearTimeout(timeout)

    timeout = setTimeout(() => {
      func(...args)
    }, wait)
  }
}
