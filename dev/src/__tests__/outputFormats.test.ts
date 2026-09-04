import { expect, test } from 'vitest';

import { expandNotation } from '../expandNotation.ts';
import {
  OUTPUT_FORMAT_OPTIONS,
  toOutputFormat,
  writeMolecule,
} from '../outputFormats.ts';

const { molecule } = expandNotation('HAlaGlyOH');

test('the SMILES of HAlaGlyOH keeps the stereo centre', () => {
  expect(molecule && writeMolecule(molecule, 'smiles')).toBe(
    'C[C@@H](C(NCC(O)=O)=O)N',
  );
});

test('the ID code of HAlaGlyOH is written', () => {
  expect(molecule && writeMolecule(molecule, 'idcode')).toBe(
    'deeL@DhAgHheDXuUMFP@',
  );
});

test('the V2000 molfile counts the 10 atoms and 9 bonds', () => {
  const lines = (molecule ? writeMolecule(molecule, 'molfile') : '').split(
    '\n',
  );

  expect(lines[3]).toBe(' 10  9  0  0  1  0  0  0  0  0999 V2000');
});

test('the V3000 molfile counts the same atoms and bonds', () => {
  const molfile = molecule ? writeMolecule(molecule, 'molfileV3') : '';

  expect(molfile).toContain('M  V30 COUNTS 10 9 0 0 0');
});

test('the four formats the panel offers are the ones it can write', () => {
  expect(OUTPUT_FORMAT_OPTIONS.map((option) => option.value)).toStrictEqual([
    'molfile',
    'molfileV3',
    'smiles',
    'idcode',
  ]);
});

test('an unknown segment value falls back to the molfile', () => {
  expect(toOutputFormat('smiles')).toBe('smiles');
  expect(toOutputFormat('cif')).toBe('molfile');
});
