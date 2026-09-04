import { expandChemicalGroups } from 'expand-chemical-groups';
import type { Molecule } from 'openchemlib';

export interface CompiledNotation {
  /** The molecule the notation built, `null` when the expansion threw. */
  molecule: Molecule | null;
  /** The message it threw, `null` when it did not. */
  error: string | null;
}

/**
 * Expand a notation, keeping what it throws.
 *
 * The message matters as much as the molecule here: a notation is debugged by
 * reading the refusal, so it is reported rather than swallowed.
 * @param notation - The group notation, `HAlaGlyOH`, `HODampDcmpH`, …
 * @returns The molecule, or the message it threw.
 */
export function expandNotation(notation: string): CompiledNotation {
  try {
    return { molecule: expandChemicalGroups(notation), error: null };
  } catch (error) {
    return {
      molecule: null,
      error: error instanceof Error ? error.message : String(error),
    };
  }
}
