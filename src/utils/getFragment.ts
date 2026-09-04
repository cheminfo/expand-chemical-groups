import { groupsObject } from 'chemical-groups';
import type { Molecule } from 'openchemlib';

import type { OCL } from '../expandChemicalGroups.ts';

import { getAttachmentAtomicNumbers } from './attachmentPoints.ts';

/**
 * The structure one symbol of the notation stands for.
 *
 * Everything the notation writes is a structure carrying attachment points, so
 * there is no second kind of token to tell apart: `chemical-groups` answers for
 * `Ala`, `Damp` and `D`, and a plain chemical element is answered with the same
 * shape — one atom carrying one attachment point per bond it can make, so `H`
 * is `H-R` and `O` is `R1-O-R2`. A new building block is a new entry, in
 * `chemical-groups` or here; nothing about the chain has to know.
 * @param ocl - openchemlib.
 * @param symbol - symbol of the group or of the element.
 * @returns the structure, as a fresh molecule.
 */
export function getFragment(ocl: OCL, symbol: string): Molecule {
  const { Molecule } = ocl;
  const group = groupsObject[symbol];
  if (group?.ocl) {
    const fragment = Molecule.fromIDCode(
      group.ocl.value,
      group.ocl.coordinates,
    );
    if (fragment.getAllAtoms() === 0) {
      throw new Error(`the structure of group ${symbol} is empty`);
    }
    return fragment;
  }

  const element = elementFragment(ocl, symbol);
  if (element === undefined) {
    throw new Error(`unknown group in sequence: ${symbol}`);
  }
  return element;
}

/**
 * Whether the notation can write a symbol at all.
 * @param ocl - openchemlib.
 * @param symbol - the symbol to look up.
 * @returns `true` when a structure is known for it.
 */
export function isFragment(ocl: OCL, symbol: string): boolean {
  return (
    Boolean(groupsObject[symbol]?.ocl) ||
    elementFragment(ocl, symbol) !== undefined
  );
}

/**
 * Whether a symbol's structure carries the `R3` a side chain is bonded to.
 *
 * This is what tells a parenthesis holding a side chain from one merely
 * grouping a block of the chain: `Cysp(Ph)` fills the residue's `R3`, while
 * `H(Ala)` writes an alanine in the chain because `H` has no site to fill.
 * @param ocl - openchemlib.
 * @param symbol - the symbol the parenthesis follows.
 * @returns `true` when the parenthesis after it names a side chain.
 */
export function hasSideChainSite(ocl: OCL, symbol: string): boolean {
  let fragment;
  try {
    fragment = getFragment(ocl, symbol);
  } catch {
    return false;
  }
  const { r3 } = getAttachmentAtomicNumbers(ocl);
  for (let atom = 0; atom < fragment.getAllAtoms(); atom++) {
    if (fragment.getAtomicNo(atom) === r3) return true;
  }
  return false;
}

/**
 * One atom of an element, carrying one attachment point per bond it can make.
 * @param ocl - openchemlib.
 * @param symbol - symbol of the element.
 * @returns the fragment, `undefined` when openchemlib knows no such element.
 */
function elementFragment(ocl: OCL, symbol: string): Molecule | undefined {
  const { Molecule } = ocl;
  const atomicNo = Molecule.getAtomicNoFromLabel(symbol);
  const bonds = Molecule.cAtomValence[atomicNo]?.[0];
  if (!atomicNo || bonds === undefined) return undefined;

  const attachments = getAttachmentAtomicNumbers(ocl);
  const fragment = new Molecule(1 + bonds, bonds);
  const center = fragment.addAtom(atomicNo);
  for (let bond = 0; bond < bonds; bond++) {
    fragment.addBond(center, fragment.addAtom(attachments.r));
  }
  return fragment;
}
