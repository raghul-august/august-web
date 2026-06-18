'use client';

import { useState, useRef, useCallback, useEffect } from 'react';
import logger from '@/utils/logger';

export interface VoiceRecorderResult {
    isRecording: boolean;
    duration: number;
    analyserNode: AnalyserNode | null;
    error: string | null;
    startRecording: () => Promise<void>;
    stopRecording: () => Promise<Blob | null>;
    cancelRecording: () => void;
}

/**
 * Custom hook for recording audio using the browser MediaRecorder API.
 * Mirrors the mobile app's recording flow.
 */
export function useVoiceRecorder(): VoiceRecorderResult {
    const [isRecording, setIsRecording] = useState(false);
    const [duration, setDuration] = useState(0);
    const [error, setError] = useState<string | null>(null);
    const [analyserNode, setAnalyserNode] = useState<AnalyserNode | null>(null);

    const mediaRecorderRef = useRef<MediaRecorder | null>(null);
    const chunksRef = useRef<Blob[]>([]);
    const streamRef = useRef<MediaStream | null>(null);
    const audioContextRef = useRef<AudioContext | null>(null);
    const timerRef = useRef<NodeJS.Timeout | null>(null);
    const resolveStopRef = useRef<((blob: Blob | null) => void) | null>(null);

    // Cleanup everything
    const cleanup = useCallback(() => {
        if (timerRef.current) {
            clearInterval(timerRef.current);
            timerRef.current = null;
        }
        if (streamRef.current) {
            streamRef.current.getTracks().forEach((track) => track.stop());
            streamRef.current = null;
        }
        if (audioContextRef.current) {
            audioContextRef.current.close().catch(() => { });
            audioContextRef.current = null;
        }
        mediaRecorderRef.current = null;
        chunksRef.current = [];
        setAnalyserNode(null);
        setDuration(0);
        setIsRecording(false);
    }, []);

    // Cleanup on unmount
    useEffect(() => {
        return () => {
            cleanup();
        };
    }, [cleanup]);

    const startRecording = useCallback(async () => {
        try {
            setError(null);

            // Request microphone permission
            const stream = await navigator.mediaDevices.getUserMedia({
                audio: {
                    channelCount: 1,
                    echoCancellation: true,
                    noiseSuppression: true,
                    autoGainControl: true,
                },
            });
            streamRef.current = stream;

            // Set up Web Audio API for waveform visualization
            const audioContext = new AudioContext();
            audioContextRef.current = audioContext;
            const source = audioContext.createMediaStreamSource(stream);
            const analyser = audioContext.createAnalyser();
            analyser.fftSize = 256;
            analyser.smoothingTimeConstant = 0.7;
            source.connect(analyser);
            setAnalyserNode(analyser);

            // Choose the best supported MIME type
            const mimeType = getSupportedMimeType();

            // Create MediaRecorder
            const mediaRecorder = new MediaRecorder(stream, {
                mimeType,
                audioBitsPerSecond: 128000,
            });

            // DEBUG: Log actual recording settings
            const audioTrack = stream.getAudioTracks()[0];
            const trackSettings = audioTrack?.getSettings();
            // logger.info('🎤 [DEBUG] Web recording - audio track settings', {
            //     sampleRate: trackSettings?.sampleRate,
            //     channelCount: trackSettings?.channelCount,
            //     echoCancellation: trackSettings?.echoCancellation,
            //     noiseSuppression: trackSettings?.noiseSuppression,
            //     autoGainControl: trackSettings?.autoGainControl,
            // });

            // logger.info('🎤 [DEBUG] Web recording - MediaRecorder config', {
            //     mimeType: mediaRecorder.mimeType,
            //     audioBitsPerSecond: mediaRecorder.audioBitsPerSecond,
            // });

            mediaRecorderRef.current = mediaRecorder;
            chunksRef.current = [];

            mediaRecorder.ondataavailable = (event) => {
                if (event.data.size > 0) {
                    chunksRef.current.push(event.data);
                }
            };

            mediaRecorder.onstop = () => {
                const blob = new Blob(chunksRef.current, { type: mimeType });
                if (resolveStopRef.current) {
                    resolveStopRef.current(blob);
                    resolveStopRef.current = null;
                }
            };

            mediaRecorder.onerror = () => {
                logger.error('MediaRecorder error');
                setError('Recording failed');
                cleanup();
            };

            // Start recording as a continuous stream (NOT chunked)
            // Using timeslice (e.g. start(100)) can produce overlapping Opus frames
            // at chunk boundaries, causing echo/duplication artifacts
            mediaRecorder.start();
            setIsRecording(true);
            setDuration(0);

            // Duration timer
            const startTime = Date.now();
            timerRef.current = setInterval(() => {
                setDuration(Math.floor((Date.now() - startTime) / 1000));
            }, 1000);

            // logger.info('Recording started successfully');
        } catch (err) {
            logger.error('Failed to start recording:', String(err));

            if (err instanceof DOMException) {
                if (err.name === 'NotAllowedError') {
                    setError('Microphone permission denied. Please allow microphone access.');
                } else if (err.name === 'NotFoundError') {
                    setError('No microphone found. Please connect a microphone.');
                } else {
                    setError('Could not access microphone.');
                }
            } else {
                setError('Failed to start recording.');
            }
            cleanup();
        }
    }, [cleanup]);

    const stopRecording = useCallback(async (): Promise<Blob | null> => {
        return new Promise((resolve) => {
            const mediaRecorder = mediaRecorderRef.current;
            if (!mediaRecorder || mediaRecorder.state === 'inactive') {
                cleanup();
                resolve(null);
                return;
            }

            resolveStopRef.current = resolve;
            mediaRecorder.stop();

            // Cleanup stream & timer, but let onstop handle the blob
            if (timerRef.current) {
                clearInterval(timerRef.current);
                timerRef.current = null;
            }
            if (streamRef.current) {
                streamRef.current.getTracks().forEach((track) => track.stop());
                streamRef.current = null;
            }
            if (audioContextRef.current) {
                audioContextRef.current.close().catch(() => { });
                audioContextRef.current = null;
            }
            setAnalyserNode(null);
            setIsRecording(false);

            // logger.info('Sending voice recording');
        });
    }, [cleanup]);

    const cancelRecording = useCallback(() => {
        // logger.info('Recording cancelled');
        resolveStopRef.current = null;
        if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
            mediaRecorderRef.current.stop();
        }
        cleanup();
    }, [cleanup]);

    return {
        isRecording,
        duration,
        analyserNode,
        error,
        startRecording,
        stopRecording,
        cancelRecording,
    };
}

/**
 * Get the best supported MIME type for audio recording.
 * Browsers vary in support — try webm/opus first, then webm, then mp4.
 */
function getSupportedMimeType(): string {
    const types = [
        'audio/webm;codecs=opus',
        'audio/webm',
        'audio/ogg;codecs=opus',
        'audio/mp4',
    ];

    for (const type of types) {
        if (MediaRecorder.isTypeSupported(type)) {
            return type;
        }
    }

    // Fallback to browser default
    return '';
}
