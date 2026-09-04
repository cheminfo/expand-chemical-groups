import * as OCL from 'openchemlib';
import { expect, test } from 'vitest';

import { expandChemicalGroups } from '../expandChemicalGroups.ts';

test('a dinucleotide is joined by a phosphodiester bond', () => {
  const molecule = expandChemicalGroups(OCL, 'HODampDcmpH');

  expect(molecule.getMolecularFormula().formula).toBe('C19H26N8O12P2');
  expect(molecule.getFragments()).toHaveLength(1);
});

test('the 3-prime terminal is a hydroxyl, not a peroxide', () => {
  // The notation ends with `…H`, and that H caps the oxygen the last R2 sits
  // on: replacing it with an oxygen — what a peptide C-terminus needs — would
  // build an O–O bond here.
  const molecule = expandChemicalGroups(OCL, 'HODampH');
  molecule.ensureHelperArrays(OCL.Molecule.cHelperNeighbours);

  let oxygenOxygenBonds = 0;
  for (let bond = 0; bond < molecule.getAllBonds(); bond++) {
    if (
      molecule.getAtomicNo(molecule.getBondAtom(0, bond)) === 8 &&
      molecule.getAtomicNo(molecule.getBondAtom(1, bond)) === 8
    ) {
      oxygenOxygenBonds++;
    }
  }

  expect(oxygenOxygenBonds).toBe(0);
  expect(molecule.getMolecularFormula().formula).toBe('C10H14N5O6P');
});

test('a dot separates strands into fragments of one molecule', () => {
  const molecule = expandChemicalGroups(OCL, 'HODampDcmpH.HODgmpDtmpH');

  expect(molecule.getFragments()).toHaveLength(2);
  expect(molecule.getMolecularFormula().formula).toBe('C39H53N15O26P4');
});

test('a notation mixing both chemistries still builds one chain', () => {
  const molecule = expandChemicalGroups(OCL, 'HAlaDampOH');

  expect(molecule.getFragments()).toHaveLength(1);
});
