import type { UploadedFile } from '@/services/media-service';

export interface UploadedFileWithSize extends UploadedFile {
    fileSize: number;
}

export function formatFileSize(bytes: number): string {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export function formatCurrency(amount: number): string {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 0, maximumFractionDigits: 0 }).format(amount);
}

export function getFileExtLabel(mimeType: string): string {
    if (mimeType.includes('pdf')) return 'PDF';
    if (mimeType.includes('png')) return 'PNG';
    if (mimeType.includes('jpeg') || mimeType.includes('jpg')) return 'JPG';
    if (mimeType.includes('gif')) return 'GIF';
    if (mimeType.includes('webp')) return 'WEBP';
    return 'FILE';
}
