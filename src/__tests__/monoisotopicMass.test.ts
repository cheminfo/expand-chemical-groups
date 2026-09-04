import { MF } from 'mf-parser';
import * as OCL from 'openchemlib';
import { expect, test } from 'vitest';

import { expandChemicalGroups } from '../expandChemicalGroups.ts';

/**
 * `mf-parser` reads the same notation without ever building a structure, so
 * its monoisotopic mass is an independent check that the condensation dropped
 * exactly the atoms it had to and that the terminals carry what they should.
 */
const NOTATIONS = [
  'HAlaGlyOH',
  'HAlaGlyOMe',
  'HAlaGlyNHMe',
  'MeAlaGlyProPh',
  'HTrpLysArgOH',
  'HODampDcmpDgmpDtmpH',
  'HOAmpCmpGmpUmpH',
];

test.each(NOTATIONS)('%s weighs what its formula weighs', (notation) => {
  const molecule = expandChemicalGroups(OCL, notation);

  // The two libraries carry their own tables of atomic masses, and openchemlib
  // rounds them to 6 decimals, so the agreement is bounded by the tables rather
  // than by the chemistry. An isotope label widens the gap further: openchemlib
  // stores deuterium as 2.014 where chemical-elements has 2.014101778.
  expect(molecule.getMolecularFormula().absoluteWeight).toBeCloseTo(
    new MF(notation).getInfo().monoisotopicMass,
    3,
  );
});
