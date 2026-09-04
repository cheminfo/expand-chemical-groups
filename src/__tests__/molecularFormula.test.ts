import { MF } from 'mf-parser';
import * as OCL from 'openchemlib';
import { expect, test } from 'vitest';

import { expandChemicalGroups } from '../expandChemicalGroups.ts';

/**
 * The structure that is built must weigh exactly what the molecular formula
 * tools compute from the same notation. This checks the condensation and the
 * terminals against an oracle that knows nothing about the structures.
 */
const NOTATIONS = [
  'HAlaGlyOH',
  'HAlaGlyProOH',
  'H(Ala)3GlyOH',
  'HAlaGlyNH2',
  'HAlaGlyOMe',
  'HAlaGlyNHMe',
  'MeAlaGlyProPh',
  'HGlyOH',
  'HTrpLysArgOH',
  'HODampH',
  'HODampDcmpH',
  'HODampDcmpDgmpDtmpH',
  'HOAmpCmpGmpUmpH',
  'HODatpDcmpH',
];

test.each(NOTATIONS)('%s weighs what its formula says', (notation) => {
  const molecule = expandChemicalGroups(OCL, notation);

  expect(molecule.getMolecularFormula().formula).toBe(
    new MF(notation).getInfo().mf,
  );
});
