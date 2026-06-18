"use client";

import { useState, useRef, useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import { Globe, ChevronDown } from "lucide-react";
import { languages, defaultLanguage } from "@/app/lib/i18n/config";

export default function LanguageSwitcher() {
  const [isOpen, setIsOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    setMounted(true);
  }, []);

  // Extract current language from pathname (e.g., /en/library -> en)
  const segments = pathname.split("/").filter(Boolean);
  const currentLangCode = (segments[0] && languages[segments[0] as keyof typeof languages]) 
    ? segments[0] 
    : defaultLanguage;
  
  const currentLanguage = languages[currentLangCode as keyof typeof languages] || languages.en;

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleLanguageSelect = (langCode: string) => {
    setIsOpen(false);
    
    // Redirect to the localized library path for the selected language
    // Since the landing page is not localized at root, we send them to the library
    router.push(`/${langCode}/library`);
  };

  // Curated list of popular languages to keep the dropdown manageable
  // In a real scenario, we might want to show all or a search box
  const popularLangCodes = ["en", "es", "fr", "de", "hi", "zh-Hans", "ja", "ar", "pt", "it"];
  
  const isLibraryPage = segments.length >= 2 && segments[1] === "library";
  
  if (!mounted || !isLibraryPage) {
    return null;
  }

  return (
    <div className="relative mt-8" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-3 px-4 py-2.5 rounded-full border border-white/10 bg-white/[0.03] text-white/70 hover:bg-white/[0.08] hover:text-white transition-all duration-200"
        aria-haspopup="true"
        aria-expanded={isOpen}
      >
        <Globe size={18} className="opacity-50" />
        <span className="text-[14px] font-medium tracking-tight">
          {currentLanguage.name}
        </span>
        <ChevronDown 
          size={16} 
          className={`opacity-40 transition-transform duration-300 ${isOpen ? "rotate-180" : ""}`} 
        />
      </button>

      {/* Dropdown Menu - Opens Upwards */}
      {isOpen && (
        <div 
          className="absolute bottom-full right-0 md:right-auto md:left-0 mb-3 w-56 max-w-[calc(100vw-48px)] max-h-[320px] overflow-y-auto rounded-2xl bg-[#1C1917] border border-white/10 shadow-[0_20px_50px_rgba(0,0,0,0.5)] z-50 animate-in fade-in slide-in-from-bottom-2 duration-200"
          style={{ scrollbarWidth: 'thin', scrollbarColor: 'rgba(255,255,255,0.1) transparent' }}
        >
          <div className="py-2">
            {Object.entries(languages).map(([code, lang]) => (
              <button
                key={code}
                onClick={() => handleLanguageSelect(code)}
                className={`w-full flex items-center px-4 py-2.5 text-sm transition-colors duration-150 ${
                  currentLangCode === code 
                    ? "bg-[#206E55] text-white" 
                    : "text-white/60 hover:bg-white/5 hover:text-white"
                }`}
              >
                <span className="flex-1 text-left">{lang.name}</span>
                {currentLangCode === code && (
                  <div className="w-1.5 h-1.5 rounded-full bg-white" />
                )}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
