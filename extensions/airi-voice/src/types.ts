/**
 * Voice System Types
 * STT (Speech-to-Text) and TTS (Text-to-Speech)
 */

export type STTProvider = "whisper" | "deepgram" | "google" | "azure" | "mock";

export type TTSProvider = "elevenlabs" | "google" | "azure" | "mock";

export interface STTConfig {
  provider: STTProvider;
  apiKey?: string;
  language: string;
  model?: string;
  streaming: boolean;
}

export interface TTSConfig {
  provider: TTSProvider;
  apiKey?: string;
  voice: string;
  language: string;
  speed: number;
  pitch: number;
}

export interface VoiceConfig {
  stt: STTConfig;
  tts: TTSConfig;
  enabled: boolean;
  autoTranscribe: boolean;
  autoSpeak: boolean;
}

export interface TranscriptSegment {
  text: string;
  confidence: number;
  start: number;
  end: number;
  language?: string;
}

export interface TranscriptResult {
  segments: TranscriptSegment[];
  fullText: string;
  language: string;
  duration: number;
}

export interface TTSRequest {
  text: string;
  voice?: string;
  speed?: number;
  format?: "mp3" | "wav" | "ogg";
}

export interface TTSResponse {
  audioUrl: string;
  audioData?: Buffer;
  duration: number;
  format: string;
}

export interface VoiceEvent {
  type: "start" | "stop" | "transcript" | "error";
  data: any;
  timestamp: number;
}
