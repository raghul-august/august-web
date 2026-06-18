import { API_CONFIG } from '@/lib/config';
import { useIncognitoStore } from '@/stores/incognito-store';

export function getActiveTenant(): string {
  const { isIncognitoMode, incognitoTenant } = useIncognitoStore.getState();
  return isIncognitoMode && incognitoTenant ? incognitoTenant : API_CONFIG.TENANT;
}
