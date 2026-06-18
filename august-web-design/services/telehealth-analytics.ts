import { track } from '@/services/analytics-service';
import { useAuthStore } from '@/stores/auth-store';
import { useTelehealthStore } from '@/stores/telehealth-store';
import { getSourceMedium, getUtmAttribution } from '@/app/utils/marketing-attribution';
import { getCurrentPage } from '@/app/utils/current-page';
import { getLocationVariant } from '@/app/utils/checkCountry';

const CAMPAIGN_ID_KEY = 'telehealth_campaign_id';

export type TelehealthBaseParams = {
  user_type: 'logged-in' | 'anon';
  offering_id: string;
  campaign_id: string;
  session_source_medium: string;
  current_page: string;
};

export function getTelehealthBaseParams(): TelehealthBaseParams {
  const { isAuthenticated } = useAuthStore.getState();
  const { offeringId } = useTelehealthStore.getState();
  const campaignId =
    typeof window !== 'undefined'
      ? sessionStorage.getItem(CAMPAIGN_ID_KEY) ?? ''
      : '';
  return {
    user_type: isAuthenticated ? 'logged-in' : 'anon',
    offering_id: offeringId ?? '',
    campaign_id: campaignId,
    session_source_medium: getSourceMedium(),
    current_page: getCurrentPage(),
  };
}

export function trackTelehealth(
  eventName: string,
  extraParams: Record<string, string | number | boolean> = {},
): void {
  track(eventName, {
    ...getTelehealthBaseParams(),
    geo_location: getLocationVariant(),
    ...getUtmAttribution(),
    ...extraParams,
  });
}
