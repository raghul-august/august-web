import { notifyError, serializeError } from '@/services/error-reporter';

type LogPayload = Record<string, unknown> | string | Error | undefined;
type LogLevel = 'info' | 'warn' | 'error';

const isProd = process.env.NODE_ENV === 'production';

const formatPayload = (payload: LogPayload): Record<string, unknown> => {
  if (!payload) {
    return {};
  }

  if (payload instanceof Error) {
    return serializeError(payload);
  }

  if (typeof payload === 'string') {
    return { message: payload };
  }

  return payload;
};

const logToConsole = (level: LogLevel, message: string, payload?: LogPayload) => {
  if (isProd) return;
  const formatted = formatPayload(payload);
  const prefix = level === 'info' ? '[INFO]' : level === 'warn' ? '[WARN]' : '[ERROR]';
  console[level](`${prefix} ${message}`, formatted);
};

const logger = {
  info(message: string, payload?: LogPayload) {
    logToConsole('info', message, payload);
  },
  warn(message: string, payload?: LogPayload) {
    logToConsole('warn', message, payload);
  },
  error(message: string, payload?: LogPayload) {
    logToConsole('error', message, payload);
    if (isProd) {
      void notifyError(message, {
        details: formatPayload(payload),
      });
    }
  },
};

export default logger;
