/**
 * Simple, production-ready console logger.
 * Can be expanded to use Winston or Bunyan in production.
 */
export const logger = {
  info: (message: string, meta?: any) => {
    const timestamp = new Date().toISOString();
    console.log(`[\x1b[36mINFO\x1b[0m]  [${timestamp}] ${message}`, meta ? JSON.stringify(meta) : '');
  },
  warn: (message: string, meta?: any) => {
    const timestamp = new Date().toISOString();
    console.warn(`[\x1b[33mWARN\x1b[0m]  [${timestamp}] ${message}`, meta ? JSON.stringify(meta) : '');
  },
  error: (message: string, error?: any) => {
    const timestamp = new Date().toISOString();
    console.error(
      `[\x1b[31mERROR\x1b[0m] [${timestamp}] ${message}`,
      error instanceof Error ? error.stack : error || ''
    );
  }
};
