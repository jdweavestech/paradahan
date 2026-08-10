"use client";

import { useState } from "react";
import { Share2, Check } from "lucide-react";

interface ShareData {
  title?: string;
  text?: string;
  url?: string;
}

/**
 * Uses the native Web Share API on devices that support it (mobile
 * browsers, mostly); falls back to copying the page link to the
 * clipboard everywhere else, with a small transient confirmation.
 */
export default function ShareButton({ spotName }: { spotName: string }) {
  const [feedback, setFeedback] = useState<string | null>(null);

  async function handleShare() {
    const url = window.location.href;
    const nav = typeof navigator !== "undefined"
      ? (navigator as Navigator & { share?: (data: ShareData) => Promise<void> })
      : undefined;

    if (nav?.share) {
      try {
        await nav.share({
          title: spotName,
          text: `Check out ${spotName} on Paradahan`,
          url,
        });
      } catch {
        // User closed the native share sheet — nothing to do.
      }
      return;
    }

    try {
      await navigator.clipboard.writeText(url);
      setFeedback("Link copied!");
    } catch {
      setFeedback("Couldn't copy the link.");
    }
    setTimeout(() => setFeedback(null), 2000);
  }

  return (
    <div className="relative">
      <button
        onClick={handleShare}
        aria-label="Share this parking spot"
        className="flex h-11 w-11 items-center justify-center rounded-full border border-border bg-white transition-colors hover:border-primary/40 hover:bg-primary-light/40"
      >
        {feedback ? (
          <Check size={18} className="text-success" />
        ) : (
          <Share2 size={18} className="text-ink/60" />
        )}
      </button>
      {feedback && (
        <span className="absolute right-0 top-full z-10 mt-2 whitespace-nowrap rounded-lg bg-dark px-2.5 py-1.5 text-xs font-medium text-white shadow-lg">
          {feedback}
        </span>
      )}
    </div>
  );
}
