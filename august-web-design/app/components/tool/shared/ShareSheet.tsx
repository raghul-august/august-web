"use client";

import { useState } from "react";
import * as Dialog from "@radix-ui/react-dialog";
import { motion, AnimatePresence } from "framer-motion";
import { colors } from "../../../utils/tools/tool-colors";

interface ShareSheetProps {
  isOpen: boolean;
  onClose: () => void;
  shareUrl: string;
  shareText: string;
}

export default function ShareSheet({ isOpen, onClose, shareUrl, shareText }: ShareSheetProps) {
  const [hovered, setHovered] = useState<string | null>(null);

  const enc = encodeURIComponent(shareText);
  const encUrl = encodeURIComponent(shareUrl);

  const opts = [
    {
      name: "WhatsApp",
      color: "#25D366",
      url: `https://wa.me/?text=${enc}%20${encUrl}`,
      icon: (
        <svg viewBox="0 0 24 24" width="22" height="22" fill="currentColor">
          <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
        </svg>
      ),
    },
    {
      name: "X",
      color: "#000",
      url: `https://twitter.com/intent/tweet?text=${enc}&url=${encUrl}`,
      icon: (
        <svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor">
          <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
        </svg>
      ),
    },
    {
      name: "Facebook",
      color: "#1877F2",
      url: `https://www.facebook.com/sharer/sharer.php?u=${encUrl}&quote=${enc}`,
      icon: (
        <svg viewBox="0 0 24 24" width="22" height="22" fill="currentColor">
          <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
        </svg>
      ),
    },
    {
      name: "Copy",
      color: colors.neutral700,
      icon: (
        <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
          <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
        </svg>
      ),
      action: async () => {
        try {
          await navigator.clipboard?.writeText(`${shareText}\n${shareUrl}`);
          alert("Copied!");
          onClose();
          return;
        } catch {}
        window.prompt("Copy this link:", shareUrl);
        onClose();
      },
    },
  ];

  return (
    <Dialog.Root open={isOpen} onOpenChange={(open) => { if (!open) onClose(); }}>
      <AnimatePresence>
        {isOpen && (
          <Dialog.Portal forceMount>
            <Dialog.Overlay asChild>
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                style={{
                  position: "fixed",
                  inset: 0,
                  background: "rgba(0,0,0,0.4)",
                  backdropFilter: "blur(8px)",
                  WebkitBackdropFilter: "blur(8px)",
                  zIndex: 10000,
                }}
              />
            </Dialog.Overlay>
            <Dialog.Content
              asChild
              aria-describedby={undefined}
              onOpenAutoFocus={(e) => e.preventDefault()}
            >
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                style={{
                  position: "fixed",
                  inset: 0,
                  display: "flex",
                  alignItems: "flex-end",
                  justifyContent: "center",
                  zIndex: 10001,
                  padding: "16px",
                  pointerEvents: "none",
                }}
              >
                <motion.div
                  initial={{ y: 120 }}
                  animate={{ y: 0 }}
                  exit={{ y: 120 }}
                  transition={{ type: "spring", damping: 28, stiffness: 340 }}
                  style={{
                    background: "white",
                    borderRadius: "24px 24px 0 0",
                    width: "100%",
                    maxWidth: "420px",
                    padding: "24px 20px",
                    paddingBottom: "calc(24px + env(safe-area-inset-bottom, 0px))",
                    border: `1px solid ${colors.green100}`,
                    pointerEvents: "auto",
                  }}
                >
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "24px" }}>
                    <Dialog.Title style={{ fontSize: "0.95rem", fontWeight: 600, color: colors.green900, letterSpacing: "0.02em", margin: 0 }}>
                      Share
                    </Dialog.Title>
                    <Dialog.Close asChild>
                      <button
                        style={{
                          background: colors.neutral50,
                          border: "none",
                          borderRadius: "50%",
                          width: 32,
                          height: 32,
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          cursor: "pointer",
                          color: colors.neutral700,
                        }}
                      >
                        <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2.5">
                          <path d="M18 6L6 18M6 6l12 12" />
                        </svg>
                      </button>
                    </Dialog.Close>
                  </div>
                  <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "8px" }}>
                    {opts.map((o) => (
                      <button
                        key={o.name}
                        onMouseEnter={() => setHovered(o.name)}
                        onMouseLeave={() => setHovered(null)}
                        onClick={() => {
                          if ("action" in o && o.action) o.action();
                          else if ("url" in o && o.url) {
                            window.open(o.url, "_blank");
                            onClose();
                          }
                        }}
                        style={{
                          display: "flex",
                          flexDirection: "column",
                          alignItems: "center",
                          gap: "8px",
                          background: hovered === o.name ? colors.green50 : "transparent",
                          border: "none",
                          borderRadius: "16px",
                          padding: "14px 8px",
                          cursor: "pointer",
                          transition: "background 0.15s",
                        }}
                      >
                        <div style={{ width: 48, height: 48, borderRadius: "50%", background: colors.neutral50, display: "flex", alignItems: "center", justifyContent: "center", color: o.color }}>
                          {o.icon}
                        </div>
                        <span style={{ fontSize: "0.65rem", color: colors.neutral700, fontWeight: 500 }}>{o.name}</span>
                      </button>
                    ))}
                  </div>
                </motion.div>
              </motion.div>
            </Dialog.Content>
          </Dialog.Portal>
        )}
      </AnimatePresence>
    </Dialog.Root>
  );
}
