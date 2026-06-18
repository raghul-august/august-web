import axiosInstance from '@/lib/axios';
import { getActiveTenant } from '@/lib/tenant';
import { trackClevertap } from '@/utils/clevertap';

export interface UploadedFile {
  fileURL: string;
  signedURL: string;
  blobName: string;
  fileName: string;
  mimeType: string;
  isVoice?: boolean;
}

export interface UploadMediaResponse {
  files: {
    [key: string]: {
      fileURL: string;
      signedURL: string;
      blobName: string;
    };
  };
}

/**
 * Upload media file (image or PDF) to the server
 */
export async function uploadMedia(file: File): Promise<UploadedFile> {
  const formData = new FormData();
  formData.append('files', file);

  trackClevertap('Media Upload', { source: file.type.startsWith('image/') ? 'gallery' : 'files' });

  const response = await axiosInstance.post<UploadMediaResponse>(
    `/user/${getActiveTenant()}/upload-media`,
    formData,
    {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    }
  );

  const uploadedFile = response.data.files['0'];

  if (!uploadedFile) {
    throw new Error('No file returned from upload');
  }

  return {
    fileURL: uploadedFile.fileURL,
    signedURL: uploadedFile.signedURL,
    blobName: uploadedFile.blobName,
    fileName: file.name,
    mimeType: file.type,
  };
}

/**
 * Get accepted file types for upload
 */
export const ACCEPTED_FILE_TYPES = {
  image: 'image/jpeg,image/png,image/gif,image/webp',
  pdf: 'application/pdf',
  audio: 'audio/webm,audio/ogg,audio/mp4,audio/wav,audio/mpeg,audio/m4a',
  all: 'image/jpeg,image/png,image/gif,image/webp,application/pdf,audio/webm,audio/ogg,audio/mp4,audio/wav,audio/mpeg,audio/m4a',
};

/**
 * Check if file type is valid
 */
export function isValidFileType(file: File): boolean {
  const validTypes = [
    'image/jpeg',
    'image/png',
    'image/gif',
    'image/webp',
    'application/pdf',
    'audio/webm',
    'audio/ogg',
    'audio/mp4',
    'audio/wav',
    'audio/mpeg',
    'audio/m4a',
  ];
  return validTypes.includes(file.type);
}

/**
 * Get file type category
 */
export function getFileCategory(mimeType: string): 'image' | 'pdf' | 'voice' | 'unknown' {
  if (mimeType.startsWith('image/')) return 'image';
  if (mimeType === 'application/pdf') return 'pdf';
  if (mimeType.startsWith('audio/')) return 'voice';
  return 'unknown';
}

// Browser MIME types are unreliable for .heic and .docx, so EHR report
// uploads validate by extension instead.
const REPORT_FILE_EXTENSIONS = ['pdf', 'docx', 'jpg', 'jpeg', 'png', 'webp', 'heic', 'txt'] as const;

export const REPORT_FILE_ACCEPT = REPORT_FILE_EXTENSIONS.map((e) => `.${e}`).join(',');

export function isValidReportFile(file: File): boolean {
  const dot = file.name.lastIndexOf('.');
  if (dot < 0) return false;
  const ext = file.name.slice(dot + 1).toLowerCase();
  return (REPORT_FILE_EXTENSIONS as readonly string[]).includes(ext);
}
