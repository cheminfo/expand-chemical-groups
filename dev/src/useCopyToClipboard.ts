import { useRef, useState } from 'react';

/** What the copy button reports after the last attempt. */
export type CopyStatus = 'idle' | 'copied' | 'failed';

export interface Clipboard {
  /** The outcome of the last attempt, back to `idle` after a short while. */
  status: CopyStatus;
  /** Put a string on the clipboard. */
  copy: (text: string) => Promise<void>;
}

/**
 * Copy text to the clipboard and report whether the browser accepted it.
 *
 * The write is refused outside a secure context and under some permission
 * settings, so the rejection is reported rather than assumed away.
 * @param resetDelay - milliseconds the outcome stays on the button.
 * @returns The outcome of the last attempt and the function that starts one.
 */
export function useCopyToClipboard(resetDelay = 1500): Clipboard {
  const [status, setStatus] = useState<CopyStatus>('idle');
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  async function copy(text: string) {
    if (timer.current !== null) clearTimeout(timer.current);
    try {
      await navigator.clipboard.writeText(text);
      setStatus('copied');
    } catch {
      setStatus('failed');
    }
    timer.current = setTimeout(() => setStatus('idle'), resetDelay);
  }

  return { status, copy };
}
