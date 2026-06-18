const isServer = typeof window === 'undefined';
const isDevelopment = process.env.NODE_ENV !== 'production';

const logger = {
  info: (...args) => {
    if (isDevelopment) {
      console.log(`[${isServer ? 'Server' : 'Client'}][INFO]`, ...args);
    }
  },
  
  warn: (...args) => {
    if (isDevelopment) {
      console.warn(`[${isServer ? 'Server' : 'Client'}][WARN]`, ...args);
    }
  },
  
  error: (...args) => {
    if (isDevelopment) {
      console.error(`[${isServer ? 'Server' : 'Client'}][ERROR]`, ...args);
    }
  },
  
  debug: (...args) => {
    if (isDevelopment) {
      console.debug(`[${isServer ? 'Server' : 'Client'}][DEBUG]`, ...args);
    }
  }
};

module.exports = logger;
