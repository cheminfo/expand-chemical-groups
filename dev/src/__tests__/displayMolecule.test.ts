import type { Molecule } from 'openchemlib';
import { expect, test } from 'vitest';

import type { DisplayOptions } from '../displayMolecule.ts';
import {
  DEFAULT_DISPLAY_OPTIONS,
  displayMolecule,
  hydrogenMode,
} from '../displayMolecule.ts';
import { expandNotation } from '../expandNotation.ts';

test('the hydrogen toggles add exactly the hydrogens they name', () => {
  const source = expand('HAlaLysArgOH');

  expect(atomCounts(source)).toStrictEqual({
    plain: 26,
    expandHydrogens: 57,
    chiralHydrogens: 29,
    both: 57,
  });
});

test('a second stereocentre is a second chiral hydrogen', () => {
  const source = expand('HAlaAlaGlyOH');

  expect(atomCounts(source)).toStrictEqual({
    plain: 15,
    expandHydrogens: 30,
    chiralHydrogens: 17,
    both: 30,
  });
});

test('drawing the molecule never touches the one the library returned', () => {
  const source = expand('HAlaLysArgOH');

  displayMolecule(source, { ...DEFAULT_DISPLAY_OPTIONS, showCIP: true });
  displayMolecule(source, {
    ...DEFAULT_DISPLAY_OPTIONS,
    expandHydrogens: true,
  });
  displayMolecule(source, {
    ...DEFAULT_DISPLAY_OPTIONS,
    showProchirality: true,
  });

  expect(source.getAllAtoms()).toBe(26);
  expect(source.getMolecularFormula().formula).toBe('C15H31N7O4');
});

test('a heavy atom keeps its index whatever the drawing shows', () => {
  const source = expand('HAlaLysArgOH');
  const heavy = [14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25];
  const before = elementsOf(source, heavy);

  expect(before).toStrictEqual([7, 6, 8, 6, 7, 6, 6, 6, 7, 6, 7, 7]);

  for (const options of everyView()) {
    const { molecule } = displayMolecule(source, options);

    expect(elementsOf(molecule, heavy)).toStrictEqual(before);
  }
});

test('the prochiral hydrogens of HAlaGlyOH are labelled pro-R then pro-S', () => {
  const { molecule } = displayMolecule(expand('HAlaGlyOH'), {
    ...DEFAULT_DISPLAY_OPTIONS,
    showProchirality: true,
  });

  expect(molecule.getAllAtoms()).toBe(20);
  expect(customLabels(molecule)).toStrictEqual([
    [17, ']r'],
    [18, ']s'],
  ]);
});

test('the fourteen prochiral hydrogens of HAlaLysArgOH are labelled', () => {
  const { molecule } = displayMolecule(expand('HAlaLysArgOH'), {
    ...DEFAULT_DISPLAY_OPTIONS,
    showProchirality: true,
  });

  expect(molecule.getAllAtoms()).toBe(57);
  expect(customLabels(molecule).map(([atom]) => atom)).toStrictEqual([
    35, 36, 37, 38, 39, 40, 41, 42, 47, 48, 49, 50, 51, 52,
  ]);
});

test('the labels survive the V2000 molfile the renderer is fed', () => {
  const { molecule } = displayMolecule(expand('HAlaGlyOH'), {
    ...DEFAULT_DISPLAY_OPTIONS,
    showProchirality: true,
  });
  const molfile = molecule.toMolfile();

  expect(molfile).toContain('NOSEARCH_OCL_CUSTOM_LABEL');
  expect(molfile).toContain('M  SED   1 ]s');
  expect(molfile).toContain('M  SED   2 ]r');
});

test('the CIP toggle is what suppresses the descriptors', () => {
  const source = expand('HAlaGlyOH');

  expect(
    displayMolecule(source, DEFAULT_DISPLAY_OPTIONS).depictorOptions,
  ).toStrictEqual({ suppressCIPParity: true });
  expect(
    displayMolecule(source, { ...DEFAULT_DISPLAY_OPTIONS, showCIP: true })
      .depictorOptions,
  ).toStrictEqual({ suppressCIPParity: false });
});

test('a hydrogen view wins over the ones it already covers', () => {
  expect(hydrogenMode(DEFAULT_DISPLAY_OPTIONS)).toBe('none');
  expect(
    hydrogenMode({ ...DEFAULT_DISPLAY_OPTIONS, chiralHydrogens: true }),
  ).toBe('chiral');
  expect(
    hydrogenMode({
      ...DEFAULT_DISPLAY_OPTIONS,
      chiralHydrogens: true,
      expandHydrogens: true,
    }),
  ).toBe('all');
  expect(
    hydrogenMode({
      ...DEFAULT_DISPLAY_OPTIONS,
      chiralHydrogens: true,
      showProchirality: true,
    }),
  ).toBe('all');
});

function expand(notation: string): Molecule {
  const { molecule, error } = expandNotation(notation);
  if (!molecule) throw new Error(`${notation}: ${String(error)}`);
  return molecule;
}

function elementsOf(molecule: Molecule, atoms: number[]): number[] {
  const elements: number[] = [];
  for (const atom of atoms) {
    elements.push(molecule.getAtomicNo(atom));
  }
  return elements;
}

function atomCounts(source: Molecule) {
  const count = (options: Partial<DisplayOptions>) =>
    displayMolecule(source, {
      ...DEFAULT_DISPLAY_OPTIONS,
      ...options,
    }).molecule.getAllAtoms();

  return {
    plain: count({}),
    expandHydrogens: count({ expandHydrogens: true }),
    chiralHydrogens: count({ chiralHydrogens: true }),
    both: count({ expandHydrogens: true, chiralHydrogens: true }),
  };
}

function customLabels(molecule: Molecule): Array<[number, string]> {
  const labels: Array<[number, string]> = [];
  for (let atom = 0; atom < molecule.getAllAtoms(); atom++) {
    const label = molecule.getAtomCustomLabel(atom);
    if (label) labels.push([atom, label]);
  }
  return labels;
}

function everyView(): DisplayOptions[] {
  const views: DisplayOptions[] = [];
  for (const expandHydrogens of [false, true]) {
    for (const chiralHydrogens of [false, true]) {
      for (const showCIP of [false, true]) {
        for (const showProchirality of [false, true]) {
          views.push({
            expandHydrogens,
            chiralHydrogens,
            showCIP,
            showProchirality,
          });
        }
      }
    }
  }
  return views;
}
