export const BASE_USERS = 5242831;
export const BASE_TIMESTAMP = 1767772722915;
export const USERS_PER_MINUTE = 13;

export function calculateInitialUsers() {
  const now = Date.now();
  const minutesPassed = Math.floor((now - BASE_TIMESTAMP) / 60000);
  return BASE_USERS + minutesPassed * USERS_PER_MINUTE;
}
