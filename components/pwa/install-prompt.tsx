"use client";

import { useState, useEffect, useCallback } from "react";
import { X, Download, Share } from "lucide-react";

interface BeforeInstallPromptEvent extends Event {
  prompt(): Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

const DISMISS_KEY = "freelancehq-install-dismissed";
const DISMISS_DURATION_MS = 7 * 24 * 60 * 60 * 1000; // 7 days

function isMobile(): boolean {
  if (typeof window === "undefined") return false;
  return /Android|iPhone|iPad|iPod/i.test(navigator.userAgent);
}

function isIos(): boolean {
  if (typeof window === "undefined") return false;
  return /iPhone|iPad|iPod/i.test(navigator.userAgent);
}

function isInStandaloneMode(): boolean {
  if (typeof window === "undefined") return false;
  return (
    window.matchMedia("(display-mode: standalone)").matches ||
    ("standalone" in navigator && (navigator as unknown as { standalone: boolean }).standalone === true)
  );
}

function wasDismissedRecently(): boolean {
  if (typeof window === "undefined") return false;
  const raw = localStorage.getItem(DISMISS_KEY);
  if (!raw) return false;
  const dismissedAt = Number(raw);
  return Date.now() - dismissedAt < DISMISS_DURATION_MS;
}

export function InstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] =
    useState<BeforeInstallPromptEvent | null>(null);
  const [showPrompt, setShowPrompt] = useState(false);
  const [isIosDevice, setIsIosDevice] = useState(false);
  const [isClosing, setIsClosing] = useState(false);

  useEffect(() => {
    // Don't show if already installed, not mobile, or recently dismissed
    if (isInStandaloneMode() || !isMobile() || wasDismissedRecently()) return;

    const iosDevice = isIos();
    setIsIosDevice(iosDevice);

    if (iosDevice) {
      // iOS doesn't fire beforeinstallprompt — show instructions after a delay
      const timer = setTimeout(() => setShowPrompt(true), 2000);
      return () => clearTimeout(timer);
    }

    // Android / Chrome — listen for the native install prompt
    function handleBeforeInstall(e: Event) {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
      setTimeout(() => setShowPrompt(true), 1500);
    }

    window.addEventListener("beforeinstallprompt", handleBeforeInstall);
    return () =>
      window.removeEventListener("beforeinstallprompt", handleBeforeInstall);
  }, []);

  const dismiss = useCallback(() => {
    setIsClosing(true);
    setTimeout(() => {
      setShowPrompt(false);
      setIsClosing(false);
      localStorage.setItem(DISMISS_KEY, String(Date.now()));
    }, 300);
  }, []);

  const handleInstall = useCallback(async () => {
    if (!deferredPrompt) return;
    await deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === "accepted") {
      setShowPrompt(false);
    }
    setDeferredPrompt(null);
  }, [deferredPrompt]);

  if (!showPrompt) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        className={`fixed inset-0 z-[100] bg-black/40 transition-opacity duration-300 ${
          isClosing ? "opacity-0" : "opacity-100"
        }`}
        onClick={dismiss}
      />

      {/* Popup */}
      <div
        className={`fixed bottom-0 left-0 right-0 z-[101] transition-transform duration-300 ease-out ${
          isClosing ? "translate-y-full" : "translate-y-0"
        }`}
      >
        <div className="mx-auto max-w-lg rounded-t-2xl bg-white px-6 pb-8 pt-4 shadow-2xl">
          {/* Handle bar */}
          <div className="mx-auto mb-4 h-1 w-10 rounded-full bg-zinc-300" />

          {/* Close button */}
          <button
            onClick={dismiss}
            className="absolute right-4 top-4 rounded-full p-1.5 text-zinc-400 transition-colors hover:bg-zinc-100 hover:text-zinc-600"
            aria-label="Dismiss"
          >
            <X className="h-5 w-5" />
          </button>

          {/* Icon & content */}
          <div className="flex flex-col items-center text-center">
            <div className="mb-4 flex h-16 w-16 items-center justify-center overflow-hidden rounded-2xl bg-gradient-to-br from-violet-600 to-indigo-600 shadow-lg">
              <img
                src="/icon-192.png"
                alt="FreelanceHQ"
                className="h-full w-full object-cover"
              />
            </div>

            <h2 className="mb-1 text-lg font-semibold text-zinc-900">
              Install FreelanceHQ
            </h2>
            <p className="mb-6 text-sm text-zinc-500">
              Add to your home screen for quick access and a native app
              experience.
            </p>

            {isIosDevice ? (
              /* iOS instructions */
              <div className="w-full space-y-3">
                <div className="flex items-center gap-3 rounded-xl bg-zinc-50 px-4 py-3 text-left">
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-blue-100">
                    <Share className="h-4 w-4 text-blue-600" />
                  </div>
                  <p className="text-sm text-zinc-700">
                    Tap the{" "}
                    <span className="font-medium text-blue-600">Share</span>{" "}
                    button in Safari
                  </p>
                </div>
                <div className="flex items-center gap-3 rounded-xl bg-zinc-50 px-4 py-3 text-left">
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-violet-100">
                    <Download className="h-4 w-4 text-violet-600" />
                  </div>
                  <p className="text-sm text-zinc-700">
                    Select{" "}
                    <span className="font-medium text-violet-600">
                      Add to Home Screen
                    </span>
                  </p>
                </div>
                <button
                  onClick={dismiss}
                  className="mt-2 w-full rounded-xl bg-zinc-900 py-3 text-sm font-medium text-white transition-colors hover:bg-zinc-800"
                >
                  Got it
                </button>
              </div>
            ) : (
              /* Android / Chrome install button */
              <div className="flex w-full gap-3">
                <button
                  onClick={dismiss}
                  className="flex-1 rounded-xl border border-zinc-200 py-3 text-sm font-medium text-zinc-600 transition-colors hover:bg-zinc-50"
                >
                  Not now
                </button>
                <button
                  onClick={handleInstall}
                  className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600 py-3 text-sm font-medium text-white shadow-md transition-all hover:from-violet-500 hover:to-indigo-500"
                >
                  <Download className="h-4 w-4" />
                  Install
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
