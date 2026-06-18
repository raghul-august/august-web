/**
 * Audio conversion utilities for cross-platform compatibility.
 * 
 * Browsers record audio as WebM/Opus, but iOS AVPlayer cannot decode WebM.
 * This module converts WebM audio to WAV (PCM) format before uploading,
 * ensuring backward compatibility with the iOS/Android mobile app.
 * 
 * Flow:
 * 1. Browser records → WebM/Opus blob
 * 2. convertBlobToWav() → decodes via Web Audio API → encodes as WAV (PCM 16-bit)
 * 3. Upload WAV file → server stores as-is
 * 4. iOS AVPlayer plays WAV without issues ✓
 */

import logger from '@/utils/logger';

/**
 * Convert any audio Blob to WAV format using Web Audio API.
 * Decodes at native sample rate, mono, then encodes as PCM 16-bit WAV.
 * 
 * @param blob - Audio blob (typically WebM/Opus from MediaRecorder)
 * @returns WAV format Blob
 */
export async function convertBlobToWav(blob: Blob): Promise<Blob> {
  const arrayBuffer = await blob.arrayBuffer();
  const audioContext = new AudioContext();

  let audioBuffer: AudioBuffer;
  try {
    audioBuffer = await audioContext.decodeAudioData(arrayBuffer);
  } finally {
    await audioContext.close();
  }

  // logger.info('🎤 [DEBUG] WAV conversion - decoded audio properties', {
  //   sampleRate: audioBuffer.sampleRate,
  //   numberOfChannels: audioBuffer.numberOfChannels,
  //   duration: audioBuffer.duration,
  //   length: audioBuffer.length,
  //   inputBlobSize: blob.size,
  //   inputBlobType: blob.type,
  // });

  // Encode as WAV (PCM 16-bit) at the native decoded sample rate
  const wavBlob = encodeWav(audioBuffer);

  // logger.info('🎤 [DEBUG] WAV conversion - output', {
  //   outputSize: wavBlob.size,
  //   outputType: wavBlob.type,
  //   compressionRatio: (blob.size / wavBlob.size).toFixed(2),
  // });

  return wavBlob;
}

/**
 * Encode an AudioBuffer as a WAV file Blob.
 * Produces standard PCM 16-bit WAV format, universally supported by
 * iOS AVPlayer, Android MediaPlayer, and all web browsers.
 */
function encodeWav(audioBuffer: AudioBuffer): Blob {
  const numChannels = audioBuffer.numberOfChannels;
  const sampleRate = audioBuffer.sampleRate;
  const bitsPerSample = 16;
  const bytesPerSample = bitsPerSample / 8;
  const blockAlign = numChannels * bytesPerSample;
  const numSamples = audioBuffer.length;
  const dataSize = numSamples * blockAlign;
  const headerSize = 44;
  const totalSize = headerSize + dataSize;

  const buffer = new ArrayBuffer(totalSize);
  const view = new DataView(buffer);

  // WAV header
  writeString(view, 0, 'RIFF');
  view.setUint32(4, totalSize - 8, true);
  writeString(view, 8, 'WAVE');

  // fmt sub-chunk
  writeString(view, 12, 'fmt ');
  view.setUint32(16, 16, true);
  view.setUint16(20, 1, true);     // PCM format
  view.setUint16(22, numChannels, true);
  view.setUint32(24, sampleRate, true);
  view.setUint32(28, sampleRate * blockAlign, true);
  view.setUint16(32, blockAlign, true);
  view.setUint16(34, bitsPerSample, true);

  // data sub-chunk
  writeString(view, 36, 'data');
  view.setUint32(40, dataSize, true);

  // Write channel data as interleaved int16
  const channelData: Float32Array[] = [];
  for (let ch = 0; ch < numChannels; ch++) {
    channelData.push(audioBuffer.getChannelData(ch));
  }

  let offset = headerSize;
  for (let i = 0; i < numSamples; i++) {
    for (let ch = 0; ch < numChannels; ch++) {
      const sample = channelData[ch][i];
      const clamped = Math.max(-1, Math.min(1, sample));
      const int16 = clamped < 0 ? clamped * 0x8000 : clamped * 0x7fff;
      view.setInt16(offset, int16, true);
      offset += bytesPerSample;
    }
  }

  return new Blob([buffer], { type: 'audio/wav' });
}

function writeString(view: DataView, offset: number, str: string): void {
  for (let i = 0; i < str.length; i++) {
    view.setUint8(offset + i, str.charCodeAt(i));
  }
}
