import type { Molecule } from 'openchemlib';

import { buildStrand } from './utils/buildStrand.ts';
import { parseGroupNotation } from './utils/parseGroupNotation.ts';

/**
 * The part of openchemlib this package builds molecules with.
 *
 * The library is a parameter rather than an import, so a page that already
 * carries openchemlib passes the copy it has and the browser bundle of this
 * package does not ship a second one.
 */
export interface OCL {
  Molecule: typeof Molecule;
}

/**
 * Build a molecule from a `chemical-groups` abbreviation.
 *
 * The notation is the one the `mass-tools` packages speak — `HAlaGlyOH`,
 * `MeAlaGlyProPh`, `H(Ala)3OH`, `HODampDcmpH` — where every symbol stands for a
 * structure carrying attachment points, the elements included: `H` is `H-R` and
 * `O` is `R1-O-R2`. Consecutive symbols are condensed by dropping the two
 * attachment points that face each other and bonding the atoms they sat on, and
 * a point nothing is condensed onto leaves its atom the hydrogen it was drawn
 * without. A notation holding several strands separated by a dot gives one
 * molecule with several fragments.
 *
 * A one-letter or database sequence is not understood here: convert it first
 * with `sequenceToMF` from `peptide` or from `nucleotide`, then pass the result.
 * @param ocl - openchemlib, as `import * as OCL from 'openchemlib'`.
 * @param notation - the group notation.
 * @returns the molecule the notation builds.
 */
export function expandChemicalGroups(ocl: OCL, notation: string): Molecule {
  const { Molecule } = ocl;
  const trimmed = notation.trim();
  if (trimmed === '') throw new Error('the notation is empty');

  const molecule = new Molecule(0, 0);

  for (const part of trimmed.split('.')) {
    if (part.trim() === '') throw new Error('the notation has an empty strand');
    molecule.addMolecule(buildStrand(ocl, parseGroupNotation(ocl, part)));
  }

  molecule.ensureHelperArrays(Molecule.cHelperParities);
  // Every group brings the coordinates of its own idcode, they would overlap.
  molecule.inventCoordinates();
  molecule.setStereoBondsFromParity();
  molecule.ensureHelperArrays(Molecule.cHelperNeighbours);

  return molecule;
}
