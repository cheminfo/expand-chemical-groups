import { groups } from 'chemical-groups';
import * as OCL from 'openchemlib';
import { expect, test } from 'vitest';

import { expandChemicalGroups } from '../../expandChemicalGroups.ts';
import { getFragment } from '../getFragment.ts';

/**
 * openchemlib moves a plain explicit hydrogen to the end of the atom list
 * whenever it recomputes its helper arrays, so a structure carrying one
 * renumbers under any index taken from it. The strand reads its attachment
 * points inside each fragment before adding it, which is what makes the `H-R`
 * fragment of a terminal safe; these two tests pin the behaviour it works
 * around.
 */
test('no group brings a plain explicit hydrogen', () => {
  const withHydrogen: string[] = [];
  for (const group of groups) {
    if (!group.ocl) continue;
    const fragment = getFragment(OCL, group.symbol);
    const explicit = fragment.getAllAtoms() - fragment.getAtoms();
    if (explicit !== 0) withHydrogen.push(`${group.symbol}: ${explicit}`);
  }

  expect(withHydrogen).toStrictEqual([]);
});

test('an idcode drops a plain explicit hydrogen', () => {
  const methanol = new OCL.Molecule(4, 4);
  const oxygen = methanol.addAtom(8);
  methanol.addBond(oxygen, methanol.addAtom(6));
  methanol.addBond(oxygen, methanol.addAtom(1));

  const roundTrip = OCL.Molecule.fromIDCode(methanol.getIDCode());

  expect(methanol.getAllAtoms()).toBe(3);
  expect(roundTrip.getAllAtoms()).toBe(2);
});

test('a deuterium keeps the atom it was given', () => {
  const molecule = expandChemicalGroups(OCL, 'HAlaOD');

  expect(molecule.getMolecularFormula().formula).toBe('C3H6NO2D');

  const isotopes: number[] = [];
  for (let atom = 0; atom < molecule.getAllAtoms(); atom++) {
    if (molecule.getAtomMass(atom) === 2) isotopes.push(atom);
  }

  expect(isotopes).toHaveLength(1);
});
