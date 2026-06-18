'use client'
import { track } from "@/app/utils/analytics";
import { useState, useEffect } from "react";
import { checkCountry } from "@/app/utils/checkCountry";
import { WhatsAppIcon } from "./WhatsAppIcon";

export function TrackedCTA({
  href,
  className,
  style,
  button_name,
  button_copy,
  children,
  initialCountry,
}: {
  href: string;
  className?: string;
  style?: React.CSSProperties;
  button_name: string;
  button_copy: string;
  children: React.ReactNode;
  initialCountry?: string | null;
}) {
  const [isIndia, setIsIndia] = useState(initialCountry === "IN");

  useEffect(() => {
    if (!initialCountry) {
      setIsIndia(checkCountry() === "IN");
    }
  }, [initialCountry]);

  const isTalkToAugustNow = button_copy.toLowerCase().trim() === "talk to august now";
  const defaultStyle: React.CSSProperties = {
    // Container styles from Framer a-tag
    opacity: 1,
    borderBottomWidth: '1px',
    borderColor: 'rgba(0, 0, 0, 0.3)',
    borderLeftWidth: '1px',
    borderRightWidth: '1px',
    borderStyle: 'solid',
    borderTopWidth: '1px',
    background: 'linear-gradient(rgb(45, 155, 119) 0%, rgb(32, 110, 85) 100%)',
    borderRadius: '52px',
    boxShadow: 'rgba(0, 0, 0, 0.18) 0px 1px 2px 0px, rgba(0, 0, 0, 0.16) 0px 4px 4px 0px, rgba(0, 0, 0, 0.09) 0px 9px 5px 0px, rgba(0, 0, 0, 0.03) 0px 16px 6px 0px, rgba(0, 0, 0, 0) 0px 24px 7px 0px',
    padding: '12px 28px',
    display: 'inline-flex',
    justifyContent: 'center',
    alignItems: 'center',
    textDecoration: 'none',
    transition: 'all 0.2s ease',
    cursor: 'pointer'
  };

  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      onClick={() =>
        track("cta_click", { button_name, button_copy })
      }
      className={className}
      style={{ ...defaultStyle, ...style }}
    >
      <div 
        style={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          gap: '8px',
          fontFamily: '"Geist", "Geist Placeholder", sans-serif',
          fontWeight: 600,
          letterSpacing: '-0.03em',
          lineHeight: '24px',
          color: 'rgb(255, 255, 255)',
        }}
      >
        {isIndia && isTalkToAugustNow && <WhatsAppIcon />}
        {children}
      </div>
    </a>
  );
}
