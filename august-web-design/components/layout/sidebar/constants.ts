import type { ToolId } from '@/lib/tools';
import {
  ChatIcon,
  ConsultsIcon,
  EhrIcon,
  NutritionIcon,
  ExploreIcon,
} from './icons';
import { TextSize } from '@/types';


export interface SidebarProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  textSize?: TextSize;
  onTextSizeChange?: (size: TextSize) => void;
}

// How many of the most-recent consults to bulk-prefetch when the encounter
// list arrives. The sidebar surfaces the top 2 in its dropdown and most
// users open one of those; 5 leaves headroom for the "View all consults"
// click landing on something just below the fold without paying for every
// encounter the user may never open.
export const BULK_PREFETCH_LIMIT = 5;

export const SIDEBAR_ENCOUNTERS_CACHE_KEY = 'sidebar:encounters';

export const NAV_OPTIONS = [
  { id: 'chat', icon: ChatIcon, labelKey: 'sidebar.tabs.chat', defaultLabel: 'Chat with august', isUSOnly: false },
  { id: 'consults', icon: ConsultsIcon, labelKey: 'sidebar.tabs.consults', defaultLabel: 'Consult a doctor', isUSOnly: true },
  { id: 'ehr', icon: EhrIcon, labelKey: 'sidebar.tabs.ehr', defaultLabel: 'View Records', isUSOnly: false },
  { id: 'nutrition', icon: NutritionIcon, labelKey: 'sidebar.tabs.nutrition', defaultLabel: 'Track nutrition', isUSOnly: false },
  { id: 'explore', icon: ExploreIcon, labelKey: 'sidebar.tabs.explore', defaultLabel: 'Health Library', isUSOnly: false },
] as const;

export type SidebarToolId = ToolId | 'all-tools';
export type NavOptionId = typeof NAV_OPTIONS[number]['id'] | SidebarToolId;

export const COLLAPSED_TOOLTIP_KEYS: Partial<Record<NavOptionId, string>> = {
  chat: 'sidebar.tooltips.chat',
  consults: 'sidebar.tooltips.consults',
  explore: 'sidebar.tooltips.explore',
  nutrition: 'sidebar.tooltips.nutrition',
  insurance: 'sidebar.tooltips.insurance',
  'cost-estimator': 'sidebar.tooltips.costEstimator',
  'bill-analyser': 'sidebar.tooltips.billAnalyser',
};

export const ROUTE_TO_NAV: Array<[RegExp, NavOptionId]> = [
  [/^\/tool\/appeal-assistant/, 'insurance'],
  [/^\/tool\/cost-estimator/, 'cost-estimator'],
  [/^\/tool\/bill-analyser/, 'bill-analyser'],
  [/^\/tool$/, 'all-tools'],
  [/^\/tool\//, 'all-tools'],
  [/^\/explore/, 'explore'],
  [/^\/ehr/, 'ehr'],
  [/^\/consults/, 'consults'],
  [/^\/consult(\/|$)/, 'consults'],
];

export const DOWNLOAD_CONTENT_CONFIG: Partial<Record<
  NavOptionId,
  { titleKey: string; defaultTitle: string; descriptionKey: string; defaultDescription: string; illustration: NavOptionId }
>> = {
  chat: {
    titleKey: 'sidebar.download.chatTitle',
    defaultTitle: 'Download app to access',
    descriptionKey: 'sidebar.download.chatDescription',
    defaultDescription: 'Keep the conversation going with your AI health guide in the August app.',
    illustration: 'chat',
  },
  explore: {
    titleKey: 'sidebar.download.exploreTitle',
    defaultTitle: 'Curated Health Articles, and Blogs',
    descriptionKey: 'sidebar.download.exploreDescription',
    defaultDescription: 'August curates health articles, blogs and other info personalized for you.',
    illustration: 'explore',
  },
  nutrition: {
    titleKey: 'sidebar.download.nutritionTitle',
    defaultTitle: 'Track what matters, improve what counts',
    descriptionKey: 'sidebar.download.nutritionDescription',
    defaultDescription: 'Track habits. Monitor vitals. See your progress - all in one place.',
    illustration: 'nutrition',
  },
  insurance: {
    titleKey: 'sidebar.download.chatTitle',
    defaultTitle: 'Download app to access',
    descriptionKey: 'sidebar.download.insuranceDescription',
    defaultDescription: 'Manage your insurance and appeals in the August app.',
    illustration: 'chat',
  },
  'bill-analyser': {
    titleKey: 'sidebar.download.chatTitle',
    defaultTitle: 'Download app to access',
    descriptionKey: 'sidebar.download.billAnalyserDescription',
    defaultDescription: 'Analyze your medical bills in the August app.',
    illustration: 'chat',
  },
  'cost-estimator': {
    titleKey: 'sidebar.download.chatTitle',
    defaultTitle: 'Download app to access',
    descriptionKey: 'sidebar.download.chatDescription',
    defaultDescription: 'Compare healthcare costs near you.',
    illustration: 'chat',
  },
};

export const DOWNLOAD_CTA_KEY = 'sidebar.download.cta';
export const DOWNLOAD_CTA_DEFAULT = 'Open in app';
export const DOWNLOAD_APP_BUTTON_KEY = 'sidebar.openInAppButton';
export const DOWNLOAD_APP_BUTTON_DEFAULT = 'Open in app';
