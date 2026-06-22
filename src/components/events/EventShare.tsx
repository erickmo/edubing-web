/**
 * EventShare — share controls for the event detail sidebar ("Bagikan").
 *
 * Offers WhatsApp + X/Twitter intent links and a "Salin tautan" button that
 * copies the canonical URL to the clipboard, briefly flashing "Tersalin!".
 *
 * SSR-safe: the share links are plain anchors (render identically on the
 * server). Clipboard access is guarded so prerendering and non-secure
 * contexts never throw.
 */

import { useState } from "react";
import { Card } from "../ui/Card";
import { Button } from "../ui/Button";

/** Props for EventShare. */
export interface EventShareProps {
  /** Absolute canonical URL to share. */
  url: string;
  /** Human title used in the prefilled share text. */
  title: string;
}

/** Milliseconds the "Tersalin!" confirmation stays visible. */
const COPIED_FEEDBACK_MS = 1800;

/**
 * Renders WhatsApp / X share links and a copy-to-clipboard button.
 */
export function EventShare({ url, title }: EventShareProps): JSX.Element {
  const [copied, setCopied] = useState(false);

  const shareText = `Ikutan ${title} di Edubing!`;
  const waHref = `https://wa.me/?text=${encodeURIComponent(`${shareText} ${url}`)}`;
  const xHref =
    `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}` +
    `&url=${encodeURIComponent(url)}`;

  /** Copy the URL, then flash confirmation. Guards missing clipboard API. */
  async function handleCopy(): Promise<void> {
    if (typeof navigator === "undefined" || !navigator.clipboard) return;
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      window.setTimeout(() => setCopied(false), COPIED_FEEDBACK_MS);
    } catch {
      // Clipboard blocked (permissions / insecure context) — fail silently.
    }
  }

  return (
    <Card className="p-6">
      <h2 className="font-display text-base font-bold text-ink">Bagikan</h2>
      <div className="mt-4 flex flex-wrap gap-2">
        <Button
          asChild
          variant="soft"
          size="sm"
          className="flex-1"
          aria-label="Bagikan via WhatsApp"
        >
          <a href={waHref} target="_blank" rel="noopener noreferrer">
            WhatsApp
          </a>
        </Button>
        <Button
          asChild
          variant="soft"
          size="sm"
          className="flex-1"
          aria-label="Bagikan via X (Twitter)"
        >
          <a href={xHref} target="_blank" rel="noopener noreferrer">
            X
          </a>
        </Button>
      </div>
      <Button
        type="button"
        variant="secondary"
        size="sm"
        className="mt-2 w-full"
        onClick={handleCopy}
      >
        {copied ? "Tersalin!" : "Salin tautan"}
      </Button>
    </Card>
  );
}
