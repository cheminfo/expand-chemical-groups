import type { Molecule } from 'openchemlib';
import * as OCL from 'openchemlib';

import { expandChemicalGroups as expand } from './expandChemicalGroups.ts';

export type { OCL } from './expandChemicalGroups.ts';

/**
 * Build a molecule from a `chemical-groups` abbreviation such as `HAlaGlyOH`.
 *
 * This is the npm entry point, so openchemlib comes from this package's own
 * dependency and the notation is the only argument. A browser bundle is built
 * from `expandChemicalGroups.ts` instead, which takes the library the page
 * already carries rather than shipping a second copy of it.
 * @param notation - the group notation.
 * @returns the molecule the notation builds.
 */
export function expandChemicalGroups(notation: string): Molecule {
  return expand(OCL, notation);
}
