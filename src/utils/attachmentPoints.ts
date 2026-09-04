import type { Molecule } from 'openchemlib';

import type { OCL } from '../expandChemicalGroups.ts';

/** The atomic numbers of the pseudo atoms a condensation ever consumes. */
export interface AttachmentAtomicNumbers {
  readonly r1: number;
  readonly r2: number;
  readonly r3: number;
  readonly r: number;
}

/** Highest R group `chemical-groups` structures can carry. */
const LAST_R_GROUP = 16;

// Built on first use rather than at import: openchemlib is injected, so it is
// not there yet when this module is evaluated.
let numbered: AttachmentAtomicNumbers | undefined;
let everyAtomicNumber: Set<number> | undefined;

/**
 * Whether an atom is an attachment point rather than a real atom.
 * @param ocl - openchemlib.
 * @param atomicNo - atomic number of the atom.
 * @returns `true` for `R` and for `R1` … `R16`.
 */
export function isAttachmentPoint(ocl: OCL, atomicNo: number): boolean {
  everyAtomicNumber ??= buildAttachmentAtomicNumbers(ocl);
  return everyAtomicNumber.has(atomicNo);
}

/**
 * Atomic numbers openchemlib uses for the `R1`, `R2`, `R3` and `R` pseudo atoms.
 * @param ocl - openchemlib.
 * @returns the four atomic numbers.
 */
export function getAttachmentAtomicNumbers(ocl: OCL): AttachmentAtomicNumbers {
  numbered ??= {
    r1: attachmentAtomicNo(ocl, 'R1'),
    r2: attachmentAtomicNo(ocl, 'R2'),
    r3: attachmentAtomicNo(ocl, 'R3'),
    r: attachmentAtomicNo(ocl, 'R'),
  };
  return numbered;
}

/**
 * Every attachment point a molecule still carries.
 * @param molecule - the molecule to scan.
 * @returns the atom indices carrying an `R`, in atom order.
 */
export function listAttachmentPoints(molecule: Molecule): number[] {
  const ocl: OCL = molecule.getOCL();
  const points: number[] = [];
  for (let atom = 0; atom < molecule.getAllAtoms(); atom++) {
    if (isAttachmentPoint(ocl, molecule.getAtomicNo(atom))) points.push(atom);
  }
  return points;
}

/**
 * Reject a strand that still holds a pseudo atom once every deletion is done.
 * @param molecule - the finished strand.
 */
export function assertNoAttachmentLeft(molecule: Molecule) {
  const [atom] = listAttachmentPoints(molecule);
  if (atom !== undefined) {
    throw new Error(
      `an attachment point ${molecule.getAtomLabel(atom)} survived the condensation`,
    );
  }
}

/**
 * Every atomic number that stands for an attachment point.
 * @param ocl - openchemlib.
 * @returns the atomic numbers of `R` and of `R1` … `R16`.
 */
function buildAttachmentAtomicNumbers(ocl: OCL): Set<number> {
  const numbers = new Set<number>([getAttachmentAtomicNumbers(ocl).r]);
  for (let index = 1; index <= LAST_R_GROUP; index++) {
    numbers.add(attachmentAtomicNo(ocl, `R${index}`));
  }
  return numbers;
}

/**
 * The atomic number openchemlib gives one pseudo atom label.
 * @param ocl - openchemlib.
 * @param label - `R`, or `R1` … `R16`.
 * @returns its atomic number.
 */
function attachmentAtomicNo(ocl: OCL, label: string): number {
  const { Molecule } = ocl;
  return label === 'R'
    ? Molecule.getAtomicNoFromLabel('R', Molecule.cPseudoAtomR)
    : Molecule.getAtomicNoFromLabel(label, Molecule.cPseudoAtomsRGroups);
}
