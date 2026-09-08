import * as OCL from 'openchemlib';
import { expect, test } from 'vitest';

import { expandChemicalGroups } from '../expandChemicalGroups.ts';

test('HAlaGlyOH gives the free dipeptide', () => {
  const molecule = expandChemicalGroups(OCL, 'HAlaGlyOH');

  expect(molecule.getMolecularFormula().formula).toBe('C5H10N2O3');
});

test('parentheses and multipliers are expanded', () => {
  const repeat = expandChemicalGroups(OCL, 'H(Ala)3GlyOH');
  const written = expandChemicalGroups(OCL, 'HAlaAlaAlaGlyOH');

  expect(repeat.getIDCode()).toBe(written.getIDCode());
  expect(repeat.getMolecularFormula().formula).toBe('C11H20N4O5');
});

test('capping groups close each end', () => {
  const molecule = expandChemicalGroups(OCL, 'MeAlaGlyProPh');

  expect(molecule.getMolecularFormula().formula).toBe('C17H23N3O3');
  expect(molecule.getFragments()).toHaveLength(1);
});

test('a C-terminal amide is built from the NH2 terminal', () => {
  const molecule = expandChemicalGroups(OCL, 'HAlaGlyNH2');

  expect(molecule.getMolecularFormula().formula).toBe('C5H11N3O2');
});

test('the molecule is exportable to the usual formats', () => {
  const molecule = expandChemicalGroups(OCL, 'HAlaGlyOH');

  expect(molecule.getIDCode()).toBe('deeL@DhAgHheDXuUMFP@');
  expect(molecule.toIsomericSmiles()).toBe('C[C@@H](C(NCC(O)=O)=O)N');
  expect(molecule.toMolfile()).toContain('V2000');
  expect(molecule.toMolfileV3()).toContain('V3000');
});

test('the stereocentres survive a molfile round trip', () => {
  // The invented coordinates carry no stereo on their own: a molfile keeps the
  // configuration only through the wedge bonds drawn from the parities.
  const molecule = expandChemicalGroups(OCL, 'HAlaValLeuOH');
  const roundTrip = OCL.Molecule.fromMolfile(molecule.toMolfile());

  expect(roundTrip.toIsomericSmiles()).toBe(
    'CC(C)C[C@@H](C(O)=O)NC([C@H](C(C)C)NC([C@H](C)N)=O)=O',
  );
  expect(roundTrip.getIDCode()).toBe(molecule.getIDCode());
});

test('an empty notation is rejected', () => {
  expect(() => expandChemicalGroups(OCL, '  ')).toThrow(
    'the notation is empty',
  );
});

test('an empty strand is rejected rather than silently dropped', () => {
  for (const notation of ['HAlaOH.', '.HAlaOH', 'HAlaOH..HGlyOH', '.', ' . ']) {
    expect(() => expandChemicalGroups(OCL, notation)).toThrow(
      'the notation has an empty strand',
    );
  }
});

test('an unknown group is rejected', () => {
  expect(() => expandChemicalGroups(OCL, 'HAlaZzzOH')).toThrow(
    'unknown group in sequence: Zzz',
  );
});
