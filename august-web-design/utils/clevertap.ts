const CLEVERTAP_ACCOUNT_ID = process.env.NEXT_PUBLIC_CLEVERTAP_ACCOUNT_ID || "";
const CLEVERTAP_REGION = "eu1";

let initialized = false;

// eslint-disable-next-line @typescript-eslint/no-explicit-any
let _ct: any = null;
function getCT() {
  if (typeof window === 'undefined') return null;
  if (!_ct) {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    _ct = require("clevertap-web-sdk");
  }
  return _ct;
}

export const initCleverTap = () => {
  const CleverTap = getCT();
  if (!CleverTap || initialized || !CLEVERTAP_ACCOUNT_ID) return;
  CleverTap.init(CLEVERTAP_ACCOUNT_ID, CLEVERTAP_REGION);
  CleverTap.spa = true;
  CleverTap.privacy.push({ optOut: false });
  CleverTap.privacy.push({ useIP: true });
  initialized = true;
};

export const trackClevertap = (
  eventName: string,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  properties: Record<string, any> = {}
) => {
  getCT()?.event?.push(eventName, properties);
};

export const onUserLogin = (
  identity: string,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  additionalProperties?: Record<string, any>
) => {

  getCT()?.onUserLogin?.push({
    Site: {
      Identity: identity,
      ...additionalProperties,
    },
  });
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const profileSet = (properties: Record<string, any>) => {
  getCT()?.profile?.push({ Site: properties });
};
