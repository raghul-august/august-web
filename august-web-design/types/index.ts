export type TextSize = 'small' | 'medium' | 'large';

// Message Types
export type MessageSender = 'user' | 'bot';

export interface MessageAttachment {
  type: 'image' | 'file' | 'pdf' | 'voice';
  uri: string;
  name?: string;
  serverUrl?: string;
  signedUrl?: string;
}

export interface ConsultPayment {
  encounterId?: string;
  amount: number | null;
  currency: string | null;
}

export interface ConsultationPayload {
  episodeId: string;
  differentialDiagnosisId: string;
  offeringIds?: string[];
  visitReason?: string;
  summary?: string;
  soapNote?: string;
  intakeFlow?: string;
  consultPayment?: ConsultPayment;
}

export type SpecialEvent =
  | 'prescription_refill_escalate'
  | 'prescription_refill_guardrail'
  | 'prescription_refill_approved';

export interface Message {
  id: string;
  text: string;
  sender: MessageSender;
  timestamp: number;
  providerMessageId?: string;
  transcription?: string | null;
  attachments?: MessageAttachment[];
  processedOutput?: string;
  systemType?: string | null;
  request_id?: string;
  feedback?: 'THUMBS_UP' | 'THUMBS_DOWN' | null;
  messageType?: string | null;
  isStreaming?: boolean;
  consultation?: ConsultationPayload;
  collapsible?: boolean;
  specialEvent?: SpecialEvent;
  phone?: string | null;
}

// API Request/Response Types
export interface SendMessageRequest {
  text: string;
  providerMessageId: string;
  attachment: string | null;
  fileExtension: string | null;
  messageType: string;
  sender: string;
  source: string;
  phoneNumber: string;
  timestamp: number;
  requestId: string;
}

export interface ChatHistoryChat {
  message: string;
  id: string;
  data?: string;
  message_type?: string;
  role: 'human' | 'assistant';
  timestamp: string;
  thread_id?: string;
  feedback?: 'THUMBS_UP' | 'THUMBS_DOWN';
  processed_output?: string;
  transcription?: string;
  signed_blob_urls?: string[];
  meta?: Record<string, unknown>;
  message_id_new?: string;
  phone?: string;
  consult_payment?: {
    encounter_id?: string;
    amount: number | null;
    currency: string | null;
  };
}

export interface ChatHistoryResponse {
  success: boolean;
  chats: Record<string, ChatHistoryChat>;
  thread_id?: string;
  last_message_id?: string;
}

// Auth Types
export interface User {
  id: string;
  phone?: string;
  email?: string;
  name?: string;
  [key: string]: unknown;
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
}

export interface AnonymousSessionResponse {
  success: boolean;
  message: string;
  user: User;
  accessToken: string;
  refreshToken: string;
  isAnonymous: boolean;
}

// WebPubSub Message Types
export interface WebPubSubMessage {
  type?: string;
  providerMessageId?: string;
  messageText?: string;
  message?: string;
  text?: string;
  threadId?: string;
  timestamp?: string;
  role?: string;
  message_type?: string;
  processed_output?: string;
  chunkId?: number;
  markdown?: string;
  reportId?: string;
  documentType?: string;
  id?: string;
  // Report citation fields
  phone?: string;
  requestId?: string;
  reports?:
    | Record<string, {
        report_id: string;
        display_type: string | null;
        citation?: string;
        signed_url?: string;
      }>
    | Array<{
        report_id: string;
        display_type: string | null;
        citation?: string;
        signed_url?: string;
      }>;
  citations?: string[];
  messageId?: string;
  consultation?: ConsultationPayload;
  collapsible?: boolean;
  special_event?: SpecialEvent;
  // prescription_refill_approved payload — SOAP note + raw conversation
  // transcript rendered in the clinician's green review card. The
  // optional `messageText` headline (e.g. "Atenolol refill approved")
  // replaces the card's default title when present.
  soap_note?: string;
  conversation?: string;
}

// Webhook Response
export interface WebhookResponse {
  thread_id?: string;
  [key: string]: unknown;
}
