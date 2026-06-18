import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { v4 as uuidv4 } from 'uuid';
import { Message, ChatHistoryChat, WebPubSubMessage, SpecialEvent, User } from '@/types';
import { useIncognitoStore, PRESCRIPTION_REFILL_TENANT } from '@/stores/incognito-store';
import { trackTelehealth } from '@/services/telehealth-analytics';
import { useAuthStore } from '@/stores/auth-store';
import logger from '@/utils/logger';

export interface ReportCitation {
  report_id?: string;
  display_type?: string | null;
  citation: string;
  signed_url?: string;
}

interface ChatState {
  // Data
  messages: Message[];

  // Loading states
  isLoading: boolean;
  isLoadingChats: boolean;
  isWaitingForResponse: boolean;
  isProcessingFile: boolean;
  processingFileTimestamp?: number;
  lastMessageId?: string;
  lastUserMessageTimestamp?: number;
  hasMoreMessages: boolean;
  reportCitations: ReportCitation[];
  isDisplayingCitations: boolean;
  pendingWebPubSubMessages: WebPubSubMessage[];

  // Server-pushed special events (prescription refill escalate/guardrail/approved).
  // chatBlocked freezes the input on escalate or guardrail; specialEvent drives
  // UI swaps elsewhere (e.g. green Approve/Reject card in the sidebar).
  chatBlocked: boolean;
  specialEvent: SpecialEvent | null;

  // Read-aloud (TTS) playback. The TTS service plays one audio at a time, so
  // starting playback on one message implicitly stops any other.
  playingMessageId: string | null;
  // Approval payload — populated when a `prescription_refill_approved` event
  // arrives over WebPubSub. Drives the SOAP note + raw conversation panel in
  // the green review card.
  approvedSoapNote: string | null;
  approvedConversation: string | null;
  // Headline copy that comes alongside the approval payload (e.g. a
  // contextual summary like "Atenolol refill approved"). When null the
  // sidebar falls back to its built-in title.
  approvedText: string | null;

  // Actions
  addMessage: (message: Message) => void;
  addOptimisticMessage: (text: string, attachments?: Message['attachments']) => string;
  addBotMessage: (message: Omit<Message, 'sender'>) => void;
  updateMessage: (id: string, updates: Partial<Message>) => void;
  clearMessages: () => void;
  setMessages: (messages: Message[]) => void;
  setIsWaitingForResponse: (isWaiting: boolean) => void;
  setIsLoadingChats: (isLoading: boolean) => void;
  setLastMessageId: (id: string | undefined) => void;
  setHasMoreMessages: (hasMore: boolean) => void;
  setIsProcessingFile: (isProcessing: boolean) => void;
  setReportCitations: (citations: ReportCitation[]) => void;
  clearReportCitations: () => void;
  enqueuePendingWebPubSubMessage: (message: WebPubSubMessage) => void;
  flushPendingWebPubSubMessages: () => void;
  completeCitationSteps: () => void;
  setSpecialEvent: (event: SpecialEvent | null) => void;
  clearSpecialEvent: () => void;
  setPlayingMessageId: (id: string | null) => void;
  // Posts the patient-facing follow-up bot message after the clinician
  // approves or rejects the refill in the green review card, clears the
  // approval state, and locks the chat (chatBlocked: true) so the only
  // path forward is the Start over button on the last bot message.
  finalizeRefillDecision: (text: string) => void;
  // Two-step variant for the Approve flow: post the message + lock the
  // chat first so the patient sees the reply, then clear the approval
  // state after the sidebar's exit animation has finished.
  postRefillDecisionMessage: (text: string) => void;
  clearRefillApproval: () => void;

  // Chat history parsing
  parseChatHistory: (chats: Record<string, ChatHistoryChat>) => Message[];

  // WebPubSub message handling
  handleWebPubSubMessage: (messageData: WebPubSubMessage) => void;

  // Reset
  reset: () => void;
}

const ONBOARDING_MESSAGE_ID = 'assistant-onboarding-message';
const ONBOARDING_MESSAGE_TEXT = `Hey there, I'm August!\n\n
Think of me as a comfy corner of the internet where you can explore all your health curiosities! ✨\n
No question is off-limits, and definitely no judgment here!  You're in a safe space to ask anything or express any concerns you might have.\n\n
So, what's on your mind? 🤔`;

const createOnboardingMessage = (): Message => ({
  id: ONBOARDING_MESSAGE_ID,
  text: ONBOARDING_MESSAGE_TEXT,
  sender: 'bot',
  timestamp: 0,
});

const removeOnboardingMessage = (messages: Message[]): Message[] =>
  messages.filter((message) => message.id !== ONBOARDING_MESSAGE_ID);

const shouldAttachOnboardingMessage = (
  messages: Message[],
  hasMoreMessages: boolean
): boolean => {
  if (hasMoreMessages) return false;
  if (messages.length === 0) return true;

  let earliestMessage = messages[0];
  for (let i = 1; i < messages.length; i += 1) {
    if (messages[i].timestamp < earliestMessage.timestamp) {
      earliestMessage = messages[i];
    }
  }

  return earliestMessage.sender === 'user';
};

const getCurrentUserPhone = (): string | null => {
  try {
    const incognito = useIncognitoStore.getState();
    if (incognito.isIncognitoMode && incognito.incognitoPhone) {
      return incognito.incognitoPhone;
    }
    const user = (useAuthStore.getState().user ?? null) as User | null;
    return user?.phone ?? null;
  } catch {
    return null;
  }
};

const messageBelongsToCurrentUser = (
  messagePhone: string | null | undefined,
  userPhone: string | null,
  isIncognito: boolean,
): boolean => {
  if (isIncognito) return true;
  if (!messagePhone || !userPhone) return true;
  return messagePhone === userPhone;
};

const filterMessagesByOwner = (messages: Message[]): Message[] => {
  const isIncognito = useIncognitoStore.getState().isIncognitoMode;
  const userPhone = getCurrentUserPhone();
  if (!userPhone) return messages;
  return messages.filter((m) => {
    const keep = messageBelongsToCurrentUser(m.phone, userPhone, isIncognito);
    if (!keep) {
      logger.warn('[chat-store] Dropping message with mismatched phone', {
        messageId: m.id,
        messagePhone: m.phone,
        userPhone,
      });
    }
    return keep;
  });
};

const applyConditionalOnboardingMessage = (
  messages: Message[],
  hasMoreMessages: boolean
): Message[] => {
  const sanitizedMessages = removeOnboardingMessage(messages);
  // Never show onboarding message in incognito mode
  if (useIncognitoStore.getState().isIncognitoMode) {
    return sanitizedMessages;
  }
  if (shouldAttachOnboardingMessage(sanitizedMessages, hasMoreMessages)) {
    return [createOnboardingMessage(), ...sanitizedMessages];
  }
  return sanitizedMessages;
};

const updateExistingOnboardingMessage = (messages?: Message[]): Message[] => {
  if (!messages) return [];
  const containsOnboarding = messages.some((message) => message.id === ONBOARDING_MESSAGE_ID);
  if (!containsOnboarding) {
    return messages;
  }
  return [createOnboardingMessage(), ...removeOnboardingMessage(messages)];
};

/** Sort messages by timestamp ascending */
const sortMessagesByTimestamp = (messages: Message[]): Message[] =>
  [...messages].sort((a, b) => a.timestamp - b.timestamp);

const previewText = (text?: string): string =>
  (text || '').replace(/\s+/g, ' ').slice(0, 120);

const getLiveDedupeReason = (existing: Message, incoming: Message): string | null => {
  if (existing.id === incoming.id) return 'id';
  if (
    existing.providerMessageId &&
    incoming.providerMessageId &&
    existing.providerMessageId === incoming.providerMessageId
  ) {
    return 'providerMessageId';
  }
  return null;
};

const normalizeConsultation = (raw: unknown): import('@/types').ConsultationPayload | undefined => {
  if (!raw || typeof raw !== 'object') return undefined;
  const r = raw as Record<string, unknown>;
  const ddId = (r.differentialDiagnosisId ?? r.differential_diagnosis_id) as string | undefined;
  const episodeId = (r.episodeId ?? r.episode_id) as string | undefined;
  if (!ddId || !episodeId) return undefined;
  return {
    episodeId,
    differentialDiagnosisId: ddId,
    offeringIds: (r.offeringIds ?? r.offering_ids) as string[] | undefined,
    visitReason: (r.visitReason ?? r.visit_reason) as string | undefined,
    summary: r.summary as string | undefined,
    soapNote: (r.soapNote ?? r.soap_note) as string | undefined,
    intakeFlow: (r.intakeFlow ?? r.intake_flow) as string | undefined,
  };
};

const initialState = {
  messages: [] as Message[],
  isLoading: false,
  isLoadingChats: false,
  isWaitingForResponse: false,
  isProcessingFile: false,
  processingFileTimestamp: undefined,
  lastMessageId: undefined,
  lastUserMessageTimestamp: undefined as number | undefined,
  hasMoreMessages: true,
  reportCitations: [] as ReportCitation[],
  isDisplayingCitations: false,
  pendingWebPubSubMessages: [] as WebPubSubMessage[],
  chatBlocked: false,
  specialEvent: null as SpecialEvent | null,
  playingMessageId: null as string | null,
  approvedSoapNote: null as string | null,
  approvedConversation: null as string | null,
  approvedText: null as string | null,
};

const isFileAcknowledgmentMessage = (message?: string): boolean => {
  if (!message) return false;
  const lowerMessage = message.toLowerCase();
  return lowerMessage.includes('thanks for sharing this file') 
};

// Filter out system messages that shouldn't be displayed
const isDisplayableMessage = (chat: ChatHistoryChat): boolean => {
  const nonDisplayableTypes = ['promotion', 'authentication', 're-engagement'];
  if (nonDisplayableTypes.includes(chat.message_type || '')) return false;
  if (isFileAcknowledgmentMessage(chat.message)) return false;
  return true;
};

// Parse attachment from chat data
const parseAttachment = (chat: ChatHistoryChat): Message['attachments'] => {
  if (!chat.data && !chat.signed_blob_urls?.length) return undefined;

  const attachments: Message['attachments'] = [];

  const metaType = (chat.meta as { type?: string })?.type;

  if (chat.signed_blob_urls?.length) {
    chat.signed_blob_urls.forEach((url) => {
      attachments.push({
        type: getAttachmentType(metaType || chat.message_type, url),
        uri: url,
        signedUrl: url,
      });
    });
  } else if (chat.data) {
    attachments.push({
      type: getAttachmentType(metaType || chat.message_type, chat.data),
      uri: chat.data,
      serverUrl: chat.data,
    });
  }

  return attachments.length > 0 ? attachments : undefined;
};

const getAttachmentType = (messageType?: string, url?: string): 'image' | 'file' | 'pdf' | 'voice' => {
  // First check message type
  switch (messageType?.toLowerCase()) {
    case 'image':
      return 'image';
    case 'pdf':
      return 'pdf';
    case 'voice':
      return 'voice';
  }

  // Fallback: try to detect from URL
  if (url) {
    const lowerUrl = url.toLowerCase();
    if (lowerUrl.includes('.jpg') || lowerUrl.includes('.jpeg') || lowerUrl.includes('.png') || lowerUrl.includes('.gif') || lowerUrl.includes('.webp')) {
      return 'image';
    }
    if (lowerUrl.includes('.pdf')) {
      return 'pdf';
    }
    if (lowerUrl.includes('.m4a') || lowerUrl.includes('.mp3') || lowerUrl.includes('.wav')) {
      return 'voice';
    }
  }

  return 'file';
};

export const useChatStore = create<ChatState>()(
  persist(
    (set, get) => ({
      ...initialState,

      addMessage: (message) => {
        set((state) => {
          // Deduplication check
          const exists = state.messages.some((m) => m.id === message.id);
          if (exists) return state;

          return {
            messages: sortMessagesByTimestamp([...state.messages, message]),
            // Track when user sends a message
            ...(message.sender === 'user' && { lastUserMessageTimestamp: message.timestamp }),
          };
        });
      },

      addOptimisticMessage: (text, attachments) => {
        const messageId = uuidv4();
        const timestamp = Date.now();
        const message: Message = {
          id: messageId,
          text,
          sender: 'user',
          timestamp,
          attachments,
          phone: getCurrentUserPhone(),
        };

        set((state) => ({
          messages: sortMessagesByTimestamp([...state.messages, message]),
          isWaitingForResponse: true,
          lastUserMessageTimestamp: timestamp,
        }));

        return messageId;
      },

      addBotMessage: (message) => {
        const botMessage: Message = {
          ...message,
          sender: 'bot',
        };

        set((state) => {
          // Deduplication check
          const exists = state.messages.some((m) => m.id === botMessage.id);
          if (exists) return state;

          return {
            messages: sortMessagesByTimestamp([...state.messages, botMessage]),
            isWaitingForResponse: false,
          };
        });
      },

      updateMessage: (id, updates) => {
        set((state) => ({
          messages: state.messages.map((m) =>
            m.id === id ? { ...m, ...updates } : m
          ),
        }));
      },

      clearMessages: () => {
        set({
          messages: [],
          lastMessageId: undefined,
          hasMoreMessages: true,
          chatBlocked: false,
          specialEvent: null,
          approvedSoapNote: null,
          approvedConversation: null,
          approvedText: null,
        });
      },

      setSpecialEvent: (event) => {
        // All three refill special events freeze the chat: escalate and
        // guardrail because the conversation is over, approved because
        // the clinician's review card is now driving the flow and the
        // patient shouldn't be able to keep typing underneath it.
        const isBlocking =
          event === 'prescription_refill_escalate' ||
          event === 'prescription_refill_guardrail' ||
          event === 'prescription_refill_approved';
        set({ specialEvent: event, chatBlocked: isBlocking });
      },

      setPlayingMessageId: (id) => {
        set({ playingMessageId: id });
      },

      clearSpecialEvent: () => {
        set({
          specialEvent: null,
          chatBlocked: false,
          approvedSoapNote: null,
          approvedConversation: null,
          approvedText: null,
        });
      },

      finalizeRefillDecision: (text) => {
        get().addBotMessage({
          id: uuidv4(),
          text,
          timestamp: Date.now(),
        });
        set({
          specialEvent: null,
          chatBlocked: true,
          approvedSoapNote: null,
          approvedConversation: null,
          approvedText: null,
        });
      },

      postRefillDecisionMessage: (text) => {
        get().addBotMessage({
          id: uuidv4(),
          text,
          timestamp: Date.now(),
        });
        // Lock the chat immediately so the patient can't keep typing
        // during the sidebar's exit animation. specialEvent + approval
        // payload are intentionally left in place until clearRefillApproval
        // runs at the end of the animation.
        set({ chatBlocked: true });
      },

      clearRefillApproval: () => {
        set({
          specialEvent: null,
          approvedSoapNote: null,
          approvedConversation: null,
          approvedText: null,
        });
      },

      setMessages: (messages) => {
        set((state) => {
          const sortedMessages = applyConditionalOnboardingMessage(
            sortMessagesByTimestamp(messages),
            state.hasMoreMessages
          );

          // Auto-clear waiting state if a new bot message appears
          let shouldClearWaiting = false;
          let shouldStopProcessing = false;
          const existingBotIds = new Set(
            state.messages.filter((m) => m.sender === 'bot').map((m) => m.id)
          );
          const hasNewNonAckBotResponse = sortedMessages.some(
            (m) =>
              m.sender === 'bot' &&
              !existingBotIds.has(m.id) &&
              !(m.text && m.text.toLowerCase().includes('thanks for sharing this file'))
          );
          if (state.isWaitingForResponse && hasNewNonAckBotResponse) {
            shouldClearWaiting = true;
          }
          if (state.isProcessingFile && hasNewNonAckBotResponse) {
            shouldStopProcessing = true;
          }

          return {
            messages: sortedMessages,
            ...(shouldClearWaiting && { isWaitingForResponse: false }),
            ...(shouldStopProcessing && {
              isProcessingFile: false,
              processingFileTimestamp: undefined,
            }),
          };
        });
      },

      setIsWaitingForResponse: (isWaiting) => {
        set({ isWaitingForResponse: isWaiting });
      },

      setIsLoadingChats: (isLoading) => {
        set({ isLoadingChats: isLoading });
      },

      setLastMessageId: (id) => {
        set({ lastMessageId: id });
      },

      setHasMoreMessages: (hasMore) => {
        set({ hasMoreMessages: hasMore });
      },

      setIsProcessingFile: (isProcessing) => {
        set({
          isProcessingFile: isProcessing,
          processingFileTimestamp: isProcessing ? Date.now() : undefined
        });
      },

      setReportCitations: (citations) => {
        set({
          reportCitations: citations,
          isWaitingForResponse: false,
          isDisplayingCitations: citations.length > 0,
        });
      },

      clearReportCitations: () => {
        set({ reportCitations: [], isDisplayingCitations: false });
        get().flushPendingWebPubSubMessages();
      },

      completeCitationSteps: () => {
        set({ isDisplayingCitations: false });
        get().flushPendingWebPubSubMessages();
      },

      enqueuePendingWebPubSubMessage: (messageData) => {
        set((state) => ({
          pendingWebPubSubMessages: [...state.pendingWebPubSubMessages, messageData],
        }));
      },

      flushPendingWebPubSubMessages: () => {
        const queue = get().pendingWebPubSubMessages;
        if (queue.length === 0) return;

        set({ pendingWebPubSubMessages: [] });
        queue.forEach((msg) => {
          setTimeout(() => {
            get().handleWebPubSubMessage(msg);
          }, 0);
        });
      },

      parseChatHistory: (chats) => {
        const isIncognito = useIncognitoStore.getState().isIncognitoMode;
        const userPhone = getCurrentUserPhone();
        const messages: Message[] = [];

        Object.values(chats).forEach((chat) => {
          if (!isDisplayableMessage(chat)) return;

          if (
            userPhone &&
            !messageBelongsToCurrentUser(chat.phone, userPhone, isIncognito)
          ) {
            logger.warn(
              '[chat-store] parseChatHistory dropping mismatched-phone message',
              { messagePhone: chat.phone, userPhone },
            );
            return;
          }

          const meta = chat.meta as Record<string, unknown> | undefined;
          let consultation =
            chat.message_type === 'doctor_consultation_component' || chat.message_type === 'doctor-consultation-component'
              ? normalizeConsultation(meta?.consultation) || normalizeConsultation(meta)
              : undefined;
          if (consultation && chat.consult_payment) {
            consultation = {
              ...consultation,
              consultPayment: {
                encounterId: chat.consult_payment.encounter_id,
                amount: chat.consult_payment.amount,
                currency: chat.consult_payment.currency,
              },
            };
          }
          const messageId = chat.id || chat.message_id_new || uuidv4();

          messages.push({
            id: messageId,
            text: chat.message || '',
            sender: chat.role === 'human' ? 'user' : 'bot',
            timestamp: new Date(chat.timestamp).getTime(),
            providerMessageId: messageId,
            feedback: chat.feedback,
            processedOutput: chat.processed_output,
            transcription: chat.transcription,
            attachments: parseAttachment(chat),
            messageType: chat.message_type,
            phone: chat.phone ?? userPhone ?? null,
            consultation,
            collapsible: meta?.collapsible === true,
          });
        });

        // Sort by timestamp ascending
        return messages.sort((a, b) => a.timestamp - b.timestamp);
      },

      handleWebPubSubMessage: (messageData) => {
        const payload = messageData;
        const currentState = get();
        const isIncognito = useIncognitoStore.getState().isIncognitoMode;
        const userPhone = getCurrentUserPhone();
        if (
          userPhone &&
          !messageBelongsToCurrentUser(payload.phone, userPhone, isIncognito)
        ) {
          logger.warn(
            '[chat-store] Dropping WebPubSub message with mismatched phone',
            { payloadPhone: payload.phone, userPhone, type: payload.type },
          );
          return;
        }
        // Narrow gate: prescription-refill tenant only. Regular `august`
        // incognito sessions still want citations / file-processing UI.
        const incognitoState = useIncognitoStore.getState();
        const isPrescriptionRefill =
          incognitoState.isIncognitoMode &&
          incognitoState.incognitoTenant === PRESCRIPTION_REFILL_TENANT;

        // Prescription-refill chats don't have citations or file
        // processing — drop those events on the floor so they can't
        // suppress the "thinking" indicator or queue subsequent messages.
        if (isPrescriptionRefill && payload.type === 'report-citation') {
          return;
        }

        if (currentState.isDisplayingCitations && payload.type !== 'report-citation') {
          logger.info('[chat-store] Queuing WebPubSub message behind citations', {
            type: payload.type,
            providerMessageId: payload.providerMessageId,
            text: previewText(payload.messageText || payload.message || payload.text),
            reportCitationCount: currentState.reportCitations.length,
            pendingWebPubSubCountBefore: currentState.pendingWebPubSubMessages.length,
            should_change_pendingWebPubSubMessages_state_to: currentState.pendingWebPubSubMessages.length + 1,
            should_change_messages_state_to: currentState.messages.length,
            should_change_isWaitingForResponse_state_to: currentState.isWaitingForResponse,
            should_change_isDisplayingCitations_state_to: currentState.isDisplayingCitations,
          });
          get().enqueuePendingWebPubSubMessage(payload);
          return;
        }

        switch (payload.type) {
          case 'transcription':
            // Voice message transcription
            if (payload.providerMessageId && payload.messageText) {
              get().updateMessage(payload.providerMessageId, {
                transcription: payload.messageText,
              });
            }
            break;

          case 'prescription-markdown':
            // Formatted medical text
            if (payload.providerMessageId && payload.markdown) {
              get().updateMessage(payload.providerMessageId, {
                processedOutput: payload.markdown,
              });
            }
            break;

          case 'report-citation': {
            const citations: ReportCitation[] = [];
            const rawReports = payload.reports;
            type RawReport = {
              report_id?: string;
              display_type?: string | null;
              citation?: string;
              signed_url?: string;
            };

            const normalizedReports: RawReport[] = Array.isArray(rawReports)
              ? rawReports
              : rawReports
                ? Object.keys(rawReports)
                    .filter((key) => key !== 'length')
                    .map((key) => rawReports[key])
                : [];

            normalizedReports.forEach((report) => {
              if (report?.citation) {
                citations.push({
                  report_id: report.report_id,
                  display_type: report.display_type,
                  citation: report.citation,
                  signed_url: report.signed_url,
                });
              }
            });

            if (citations.length === 0 && Array.isArray(payload.citations)) {
              payload.citations.forEach((text, index) => {
                if (typeof text !== 'string' || !text.trim()) return;
                const fallbackReport = normalizedReports[index];
                citations.push({
                  report_id: fallbackReport?.report_id || `citation-${index}`,
                  display_type: fallbackReport?.display_type,
                  citation: text,
                  signed_url: fallbackReport?.signed_url,
                });
              });
            }

            if (citations.length > 0) {
              get().setReportCitations(citations);
            }
            break;
          }

          case 'prescription_refill_approved': {
            // Dedicated event (no longer ridden on a `special_event` tag).
            // Carries soap_note + raw conversation transcript; the green
            // review card in the sidebar reads them from the store.
            // eslint-disable-next-line no-console
            // setSpecialEvent flips chatBlocked: true for this event
            // (see isBlocking list there), so the patient input is
            // frozen the moment the approval payload lands rather than
            // waiting on a button click.
            get().setSpecialEvent('prescription_refill_approved');
            set({
              approvedSoapNote: payload.soap_note ?? null,
              approvedConversation: payload.conversation ?? null,
              approvedText: payload.messageText ?? null,
              isWaitingForResponse: false,
            });
            break;
          }

          case 'doctor-consultation-component':
          case 'doctor_consultation_component': {
            if (!payload.consultation?.differentialDiagnosisId) {
              break;
            }
            const id = payload.providerMessageId || payload.id || payload.messageId || uuidv4();
            const newMessage: Message = {
              id,
              text: payload.consultation.visitReason || '',
              sender: 'bot',
              timestamp: payload.timestamp ? new Date(payload.timestamp).getTime() : Date.now(),
              providerMessageId: id,
              messageType: 'doctor_consultation_component',
              consultation: payload.consultation,
            };
            let isNewCard = false;
            set((state) => {
              if (state.messages.some((m) => m.id === id)) {
                logger.info('[chat-store] Deduped WebPubSub doctor consultation', {
                  id,
                  providerMessageId: payload.providerMessageId,
                  should_change_isWaitingForResponse_state_to: false,
                  should_change_messages_state_to: state.messages.length,
                });
                return { isWaitingForResponse: false };
              }
              isNewCard = true;
              return {
                messages: sortMessagesByTimestamp([...state.messages, newMessage]),
                isWaitingForResponse: false,
              };
            });
            if (isNewCard) {
              trackTelehealth('telehealth_consult_card_shown');
            }
            break;
          }

          default: {
            if (payload.chunkId !== undefined && !payload.type) {
              return;
            }

            // Special server events (prescription refill escalate / guardrail
            // / approved) ride on a normal assistant message — apply the side
            // effect to the store and tag the message so downstream UI can
            // render the Start over / approval card affordances.
            const specialEvent = payload.special_event ?? null;
            if (specialEvent) {
              // eslint-disable-next-line no-console
              get().setSpecialEvent(specialEvent);
            }

            // Standard bot message
            const newMessage: Message = {
              id: payload.providerMessageId || payload.id || uuidv4(),
              text: payload.messageText || payload.message || payload.text || '',
              sender: 'bot',
              timestamp: payload.timestamp
                ? new Date(payload.timestamp).getTime()
                : Date.now(),
              processedOutput: payload.processed_output,
              providerMessageId: payload.providerMessageId || payload.id,
              phone: payload.phone ?? userPhone ?? null,
              ...(specialEvent ? { specialEvent } : {}),
              ...(payload.collapsible ? { collapsible: true } : {}),
            };

            // Only add if there's actual content
            if (newMessage.text) {
              const messageText = newMessage.text.toLowerCase();
              // No files in the prescription-refill flow, so the "thanks
              // for sharing this file" acknowledgment branch is a no-op
              // there. The regular august chat keeps the behaviour.
              const isFileAcknowledgment =
                !isPrescriptionRefill &&
                messageText.includes('thanks for sharing this file');

              set((state) => {
                const dedupeMatch = state.messages
                  .map((m) => ({ message: m, reason: getLiveDedupeReason(m, newMessage) }))
                  .find((match) => match.reason);

                if (dedupeMatch) {
                  logger.info('[chat-store] Deduped WebPubSub bot message', {
                    incomingId: newMessage.id,
                    incomingProviderMessageId: newMessage.providerMessageId,
                    incomingText: previewText(newMessage.text),
                    matchReason: dedupeMatch.reason,
                    matchId: dedupeMatch.message.id,
                    matchProviderMessageId: dedupeMatch.message.providerMessageId,
                    matchText: previewText(dedupeMatch.message.text),
                    should_change_isWaitingForResponse_state_to: false,
                  });
                  return { isWaitingForResponse: false };
                }
                const shouldStopProcessing = state.isProcessingFile && !isFileAcknowledgment;
                if (isFileAcknowledgment) {
                  return {
                    isWaitingForResponse: false,
                    isProcessingFile: true,
                    processingFileTimestamp: Date.now(),
                  };
                }

                return {
                  messages: sortMessagesByTimestamp([...state.messages, newMessage]),
                  isWaitingForResponse: false,
                  isProcessingFile: shouldStopProcessing ? false : state.isProcessingFile,
                  processingFileTimestamp: shouldStopProcessing ? undefined : state.processingFileTimestamp,
                  reportCitations: [], // Clear citations when new message arrives
                  isDisplayingCitations: false,
                };
              });

              // Flush any pending messages that were queued during citation display
              get().flushPendingWebPubSubMessages();
            }
            break;
          }
        }
      },

      reset: () => {
        set(initialState);
      },
    }),
    {
      name: 'chat-storage',
      storage: createJSONStorage(() => {
        // Safe localStorage wrapper that handles errors
        if (typeof window === 'undefined') {
          return {
            getItem: () => null,
            setItem: () => {},
            removeItem: () => {},
          };
        }
        return {
          getItem: (name: string) => {
            try {
              return localStorage.getItem(name);
            } catch {
              return null;
            }
          },
          setItem: (name: string, value: string) => {
            try {
              localStorage.setItem(name, value);
            } catch {
            }
          },
          removeItem: (name: string) => {
            try {
              localStorage.removeItem(name);
            } catch {
            }
          },
        };
      }),
      merge: (persistedState, currentState) => {
        const persisted = (persistedState as Partial<ChatState>) || {};
        const mergedState = {
          ...currentState,
          ...persisted,
        };
        if (persisted.messages) {
          const ownedMessages = filterMessagesByOwner(persisted.messages);
          mergedState.messages = updateExistingOnboardingMessage(ownedMessages);
        }
        return mergedState;
      },
      partialize: (state) => ({
        // Don't persist messages during incognito mode to prevent leaking them to localStorage
        messages: useIncognitoStore.getState().isIncognitoMode ? [] : state.messages.slice(-100),
      }),
    }
  )
);
