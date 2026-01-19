/**
 * 개발 환경에서만 로그를 출력하는 유틸리티
 * 프로덕션 빌드에서는 자동으로 비활성화됨
 */

const isDev = __DEV__;

export const logger = {
  log: (...args: unknown[]) => {
    if (isDev) console.log(...args);
  },
  warn: (...args: unknown[]) => {
    if (isDev) console.warn(...args);
  },
  error: (...args: unknown[]) => {
    if (isDev) console.error(...args);
  },
  info: (...args: unknown[]) => {
    if (isDev) console.info(...args);
  },
};

export default logger;
