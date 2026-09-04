import { expect, test } from 'vitest';

import { NOTATION_EXAMPLES } from '../examples.ts';
import { expandNotation } from '../expandNotation.ts';

test('every example notation expands to the molecule it advertises', () => {
  const summary: Record<string, string> = {};
  for (const example of NOTATION_EXAMPLES) {
    const { molecule, error } = expandNotation(example.notation);
    if (!molecule) throw new Error(`${example.notation}: ${String(error)}`);
    summary[example.notation] =
      `${molecule.getMolecularFormula().formula} ${molecule.getAllAtoms()} atoms ` +
      `${molecule.getFragments().length} fragments`;
  }

  expect(summary).toStrictEqual({
    HAlaGlyOH: 'C5H10N2O3 10 atoms 1 fragments',
    HAlaAlaGlyOH: 'C8H15N3O4 15 atoms 1 fragments',
    HAlaGlyNH2: 'C5H11N3O2 10 atoms 1 fragments',
    MeAlaGlyProPh: 'C17H23N3O3 23 atoms 1 fragments',
    'H(Ala)3GlyOH': 'C11H20N4O5 20 atoms 1 fragments',
    HAlaLysArgOH: 'C15H31N7O4 26 atoms 1 fragments',
    'HCysp(Ph)OH': 'C9H11NO2S 13 atoms 1 fragments',
    'HAlaCysp(Bzl)GlyOH': 'C15H21N3O4S 23 atoms 1 fragments',
    HODampDcmpH: 'C19H26N8O12P2 41 atoms 1 fragments',
    HOAmpCmpH: 'C19H26N8O14P2 43 atoms 1 fragments',
    'HODampH.HODcmpH': 'C19H28N8O13P2 42 atoms 2 fragments',
  });
});

test('an unknown group is reported', () => {
  expect(expandNotation('HXyzOH')).toStrictEqual({
    molecule: null,
    error: 'unknown group in sequence: Xyz',
  });
});

test('an empty notation is reported', () => {
  expect(expandNotation(' \t')).toStrictEqual({
    molecule: null,
    error: 'the notation is empty',
  });
});
