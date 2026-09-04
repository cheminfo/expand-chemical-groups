import type { Molecule } from 'openchemlib';
import { useMemo, useState } from 'react';

import { DEFAULT_NOTATION } from './examples.ts';
import { expandNotation } from './expandNotation.ts';

export interface NotationSession {
  /** What the input holds. */
  notation: string;
  /** The molecule on screen: the current one, or the last one that worked. */
  shown: Molecule | null;
  /** `true` while the notation does not expand and an older molecule is shown. */
  stale: boolean;
  /** The message the expansion threw, `null` while the notation expands. */
  error: string | null;
  /** Put another notation in the input. */
  setNotation: (notation: string) => void;
}

/**
 * Hold the notation and the last expansion that succeeded.
 *
 * The last good molecule is kept so that a half-typed notation leaves the
 * molecule on screen instead of blanking the page under the error. It is read
 * off the one expansion this hook runs, so a keystroke builds a molecule once.
 * @returns The notation, its molecule, and the setter that changes it.
 */
export function useNotationSession(): NotationSession {
  const [notation, setNotation] = useState(DEFAULT_NOTATION);
  const compiled = useMemo(() => expandNotation(notation), [notation]);
  const [lastGood, setLastGood] = useState<Molecule | null>(null);

  // Adjusting state while rendering, which React re-runs before it paints: the
  // molecule is built once per notation and the memo is its only source.
  if (compiled.molecule !== null && compiled.molecule !== lastGood) {
    setLastGood(compiled.molecule);
  }

  return {
    notation,
    shown: compiled.molecule ?? lastGood,
    stale: compiled.molecule === null && lastGood !== null,
    error: compiled.error,
    setNotation,
  };
}
