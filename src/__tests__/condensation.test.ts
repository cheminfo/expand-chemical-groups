import * as OCL from 'openchemlib';
import { expect, test } from 'vitest';

import { expandChemicalGroups } from '../expandChemicalGroups.ts';
import { listAttachmentPoints } from '../utils/attachmentPoints.ts';

test('a side chain R never takes the place of the backbone R1', () => {
  // `Lysp` carries an `R1`, an `R2` and an `R` holding its protecting group.
  // The chain is condensed through `R1` and `R2`, so the `R` is left to be
  // capped: an unfilled protecting site builds exactly the free residue.
  const protectable = expandChemicalGroups(OCL, 'HAlaLyspOH');
  const plain = expandChemicalGroups(OCL, 'HAlaLysOH');

  expect(protectable.getIDCode()).toBe(plain.getIDCode());
  expect(protectable.getMolecularFormula().formula).toBe('C9H19N3O3');
});

test('a group whose only attachment point is a generic R still caps the chain', () => {
  const molecule = expandChemicalGroups(OCL, 'HAlaGlyPh');

  expect(molecule.getMolecularFormula().formula).toBe('C11H14N2O2');
});

test('the parentheses after a triradical residue fill its R3', () => {
  const molecule = expandChemicalGroups(OCL, 'HCysp(Ph)OH');

  expect(molecule.getMolecularFormula().formula).toBe('C9H11NO2S');
  expect(molecule.toIsomericSmiles()).toBe('N[C@@H](CSc1ccccc1)C(O)=O');
  expect(molecule.getFragments()).toHaveLength(1);
});

test('a side chain group sits inside the chain, next to the residue it hangs off', () => {
  const molecule = expandChemicalGroups(OCL, 'HAlaCysp(Bzl)GlyOH');

  expect(molecule.getMolecularFormula().formula).toBe('C15H21N3O4S');
});

test('an R3 with no parentheses is capped with hydrogen', () => {
  // The triradical `Cysp` then builds exactly the free cysteine `Cys` builds.
  const protectable = expandChemicalGroups(OCL, 'HCyspOH');
  const plain = expandChemicalGroups(OCL, 'HCysOH');

  expect(protectable.getIDCode()).toBe(plain.getIDCode());
  expect(protectable.getMolecularFormula().formula).toBe('C3H7NO2S');
});

test('a parenthesis groups the chain unless the group has a side chain site', () => {
  // `Ala` carries no `R3`, so its parentheses hold a block of the chain, the
  // same way `H(Ala)OH` writes an alanine.
  expect(expandChemicalGroups(OCL, 'HAla(Gly)OH').getIDCode()).toBe(
    expandChemicalGroups(OCL, 'HAlaGlyOH').getIDCode(),
  );
});

test('a side chain the group cannot take is reported', () => {
  expect(() => expandChemicalGroups(OCL, 'HCysp(GlyPro)OH')).toThrow(
    'the side chain (GlyPro) is not a single group',
  );
  expect(() => expandChemicalGroups(OCL, 'HCysp(Abu)OH')).toThrow(
    'the side chain of Cysp cannot be built: the group Abu has 2 attachment points',
  );
  expect(() => expandChemicalGroups(OCL, 'HCysp(Xyz)OH')).toThrow(
    'unknown group in sequence: Xyz',
  );
});

test('a multiplier still repeats the block its parentheses hold', () => {
  const repeat = expandChemicalGroups(OCL, 'H(Ala)3GlyOH');
  const single = expandChemicalGroups(OCL, 'H(Ala)OH');

  expect(repeat.getMolecularFormula().formula).toBe('C11H20N4O5');
  expect(single.getMolecularFormula().formula).toBe('C3H7NO2');
});

test('a built molecule never carries an attachment point', () => {
  const molecule = expandChemicalGroups(OCL, 'HAlaGlyProOH');
  const pseudo = listAttachmentPoints(molecule).map((atom) =>
    molecule.getAtomLabel(atom),
  );

  expect(pseudo).toStrictEqual([]);
  expect(molecule.getFragments()).toHaveLength(1);
});

test('a cap in the middle of a chain is rejected, not silently split', () => {
  // `Acet` closes the chain, so `Gly` has nothing to bond to.
  expect(() => expandChemicalGroups(OCL, 'HAlaAcetGlyOH')).toThrow(
    'the group Gly cannot be bonded to Acet',
  );
});

test('a cap still opens a chain when it comes first', () => {
  const molecule = expandChemicalGroups(OCL, 'MeAlaGlyOH');

  expect(molecule.getMolecularFormula().formula).toBe('C6H12N2O3');
});

test('an ester terminal is built from its element and its group', () => {
  const molecule = expandChemicalGroups(OCL, 'HAlaGlyOMe');

  expect(molecule.getMolecularFormula().formula).toBe('C6H12N2O3');
  expect(molecule.toIsomericSmiles()).toBe('C[C@@H](C(NCC(OC)=O)=O)N');
  expect(molecule.getFragments()).toHaveLength(1);
});

test('a terminal group is read at either end of the notation', () => {
  const ethyl = expandChemicalGroups(OCL, 'HAlaGlyOEt');
  const amide = expandChemicalGroups(OCL, 'HAlaGlyNHMe');
  const leading = expandChemicalGroups(OCL, 'MeOAlaGlyOH');

  expect(ethyl.getMolecularFormula().formula).toBe('C7H14N2O3');
  expect(amide.getMolecularFormula().formula).toBe('C6H13N3O2');
  expect(amide.toIsomericSmiles()).toBe('C[C@@H](C(NCC(NC)=O)=O)N');
  expect(leading.getMolecularFormula().formula).toBe('C6H12N2O4');
});

test('a group with nothing left to bond to is reported', () => {
  // `Me` has a single attachment point and spends it on the leading `H`, so
  // `Ala` has nothing left to condense onto.
  expect(() => expandChemicalGroups(OCL, 'HMeAlaGlyOH')).toThrow(
    'the group Ala cannot be bonded to Me',
  );
  expect(() => expandChemicalGroups(OCL, 'MeHAlaGlyOH')).toThrow(
    'the group Ala cannot be bonded to H',
  );
});

test('an empty terminal is still allowed to be absent', () => {
  const molecule = expandChemicalGroups(OCL, 'MeAlaGlyProPh');

  expect(molecule.getMolecularFormula().formula).toBe('C17H23N3O3');
});

test('an element condenses wherever it is written, not only at an end', () => {
  // Nothing distinguishes a terminal from the rest of the chain any more, so
  // an oxygen between two groups is an ester and two of them are a peroxide.
  expect(
    expandChemicalGroups(OCL, 'HAlaGlyOAlaOH').getMolecularFormula().formula,
  ).toBe('C8H15N3O5');
  expect(
    expandChemicalGroups(OCL, 'HAlaGlyOOH').getMolecularFormula().formula,
  ).toBe('C5H10N2O4');
  expect(
    expandChemicalGroups(OCL, 'HAlaGlyOAbu').getMolecularFormula().formula,
  ).toBe('C9H17N3O4');
});

test('an attachment point nothing is condensed onto becomes a hydrogen', () => {
  // The `H` of a terminal only says out loud what an unfilled point already
  // means, so writing it changes nothing.
  expect(expandChemicalGroups(OCL, 'AlaGlyO').getIDCode()).toBe(
    expandChemicalGroups(OCL, 'HAlaGlyOH').getIDCode(),
  );
  expect(expandChemicalGroups(OCL, 'HAlaGlyN').getIDCode()).toBe(
    expandChemicalGroups(OCL, 'HAlaGlyNH2').getIDCode(),
  );
});

test('one nitrogen builds every amide the notation writes', () => {
  // `NH2`, `NHMe` and `NMe2` are the same `R1-N(-R2)-R3` filled three ways,
  // which is why none of them needs an entry of its own.
  expect(formula('HAlaGlyNH2')).toBe('C5H11N3O2');
  expect(formula('HAlaGlyNHMe')).toBe('C6H13N3O2');
  expect(formula('HAlaGlyNMe2')).toBe('C7H15N3O2');
});

function formula(notation: string): string {
  return expandChemicalGroups(OCL, notation).getMolecularFormula().formula;
}
