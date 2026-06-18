import { track } from "@/app/utils/analytics";

interface StoreButtonsProps {
  googlePlayLink?: string;
  appStoreLink?: string;
  className?: string;
  section?: string;
}

export function StoreButtons({ 
  googlePlayLink = "https://join.meetaugust.ai/?c=privacy_policy_hero",
  appStoreLink = "https://join.meetaugust.ai/?c=privacy_policy_hero_ios",
  className = "flex flex-wrap justify-center gap-4 mt-8 mb-12",
  section = "general"
}: StoreButtonsProps) {
  return (
    <div className={className}>
      {/* App Store Badge */}
      <a
        href={appStoreLink}
        target="_blank"
        rel="noopener noreferrer"
        onClick={() => track("download_click", { 
          button_name: `${section}_ios` 
        })}
        className="hover:opacity-80 transition-opacity shrink-0 w-[180px] sm:w-[200px]"
        aria-label="Download on the App Store"
      >
        <svg width="100%" style={{ height: "auto" }} viewBox="0 0 135 40" fill="none" xmlns="http://www.w3.org/2000/svg">
          {/* Unified Background with sharp corners (rx="4") */}
          <rect width="135" height="40" rx="6" fill="#a6a6a6" />
          <rect x="0.5" y="0.5" width="134" height="39" rx="5.5" fill="white" />
          
          <g transform="translate(10, 8) scale(0.14)">
            {/* Apple Logo black */}
            <path d="M150.37 130.25c-2.45 5.66-5.35 10.87-8.71 15.66-4.58 6.53-8.33 11.05-11.22 13.56-4.48 4.12-9.28 6.23-14.42 6.35-3.69 0-8.14-1.05-13.32-3.18-5.2-2.12-9.97-3.17-14.34-3.17-4.58 0-9.49 1.05-14.75 3.17-5.28 2.13-9.54 3.24-12.8 3.35-4.92.21-9.84-1.96-14.75-6.52-3.13-2.73-7.05-7.41-11.76-14.04-5.04-7.08-9.19-15.29-12.44-24.65-3.49-10.15-5.23-19.97-5.23-29.45 0-10.87 2.35-20.24 7.06-28.06 3.69-6.31 8.6-11.3 14.75-14.95 6.15-3.65 12.8-5.51 19.97-5.72 3.91 0 9.05 1.21 15.43 3.59 6.36 2.39 10.45 3.6 12.24 3.6 1.34 0 5.87-1.42 13.56-4.22 7.27-2.6 13.41-3.67 18.45-3.24 13.63 1.1 23.87 6.47 30.68 16.15-12.19 7.39-18.22 17.73-18.1 31 .11 10.34 3.86 18.94 11.23 25.77 3.34 3.17 7.07 5.62 11.22 7.36-.9 2.61-1.85 5.11-2.86 7.51zM119.11 7.24c0 8.1-2.96 15.67-8.86 22.67-7.12 8.32-15.73 13.13-25.07 12.37-.12-.97-.18-1.99-.18-3.07 0-7.77 3.38-16.09 9.39-22.89 3-3.44 6.82-6.31 11.45-8.6 4.62-2.26 8.99-3.51 13.1-3.72.12 1.1.17 2.2.17 3.24z" fill="black" />
          </g>
          <text x="38" y="15" fill="black" style={{ fontFamily: 'var(--font-inter), sans-serif', fontSize: '7px', fontWeight: 700, letterSpacing: '0.2px' }}>Download on the</text>
          <text x="38" y="30" fill="black" style={{ fontFamily: 'var(--font-inter), sans-serif', fontSize: '15px', fontWeight: 600 }}>App Store</text>
        </svg>
      </a>
 
      {/* Google Play Badge */}
      <a
        href={googlePlayLink}
        target="_blank"
        rel="noopener noreferrer"
        onClick={() => track("download_click", { 
          button_name: `${section}_android` 
        })}
        className="hover:opacity-80 transition-opacity shrink-0 w-[180px] sm:w-[200px]"
        aria-label="Get it on Google Play"
      >
        <svg width="100%" style={{ height: "auto" }} viewBox="0 0 135 40" fill="none" xmlns="http://www.w3.org/2000/svg">
          {/* Unified Background with same sharp corners (rx="4") */}
          <rect width="135" height="40" rx="6" fill="#a6a6a6" />
          <rect x="0.5" y="0.5" width="134" height="39" rx="5.5" fill="white" />
          
          <g transform="translate(10, 9) scale(1.1)">
            <path d="M1.22 0.272C0.948 0.56 0.792 1.004 0.792 1.58V20.42C0.792 20.996 0.948 21.44 1.22 21.728L1.296 21.8L11.848 11.248V11.001V10.753L1.296 0.201L1.22 0.272Z" fill="#4285F4" />
            <path d="M15.368 14.768L11.848 11.248V11.001V10.753L15.372 7.233L15.46 7.284L19.588 9.629C20.764 10.297 20.764 11.401 19.588 12.073L15.46 14.717L15.368 14.768Z" fill="#FBBC04" />
            <path d="M15.46 14.717L11.848 11.101L1.22 21.728C1.62 22.157 2.276 22.209 3.016 21.789L15.46 14.717Z" fill="#EA4335" />
            <path d="M15.46 7.284L3.016 0.213C2.276 -0.155 1.62 -0.155 1.22 0.273L11.848 10.901L15.46 7.284Z" fill="#34A853" />
          </g>
          <text x="38" y="15" fill="black" style={{ fontFamily: 'var(--font-inter), sans-serif', fontSize: '7px', fontWeight: 700, letterSpacing: '0.2px' }}>GET IT ON</text>
          <text x="38" y="30" fill="black" style={{ fontFamily: 'var(--font-inter), sans-serif', fontSize: '15px', fontWeight: 600 }}>Google Play</text>
        </svg>
      </a>
    </div>
  );
}
