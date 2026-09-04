import type { Molecule } from 'openchemlib';

import type { OCL } from '../expandChemicalGroups.ts';

import {
  getAttachmentAtomicNumbers,
  isAttachmentPoint,
} from './attachmentPoints.ts';

/** An attachment point of the strand, and the atom it sits on. */
export interface AttachmentPoint {
  /** The pseudo atom, removed once the point is bonded or capped. */
  point: number;
  /** The atom that carries it, which is what a bond is drawn to. */
  anchor: number;
  /** `true` for the `R3` a triradical residue carries on its side chain. */
  sideChain: boolean;
}

/**
 * Add a fragment to a strand and report the attachment points it brings.
 *
 * The anchors are read inside the fragment, before it is added: openchemlib
 * moves explicit hydrogens to the end of the atom list whenever it recomputes
 * its helper arrays, so a strand holding an `H` renumbers under any index taken
 * from it. Reading them here leaves the strand's helper arrays untouched until
 * every bond is drawn.
 * @param molecule - the strand being built.
 * @param fragment - the structure to add.
 * @returns the points, the one facing the previous fragment first and the side
 * chain `R3` last.
 */
export function placeFragment(
  molecule: Molecule,
  fragment: Molecule,
): AttachmentPoint[] {
  // The strand knows which openchemlib built it, so the library never has to
  // be handed to a function that already holds a molecule.
  const ocl: OCL = molecule.getOCL();
  const { Molecule } = ocl;
  fragment.ensureHelperArrays(Molecule.cHelperNeighbours);

  const local: Array<AttachmentPoint & { rank: number }> = [];
  for (let atom = 0; atom < fragment.getAllAtoms(); atom++) {
    if (!isAttachmentPoint(ocl, fragment.getAtomicNo(atom))) continue;
    const atomicNo = fragment.getAtomicNo(atom);
    local.push({
      point: atom,
      anchor: fragment.getConnAtom(atom, 0),
      sideChain: atomicNo === getAttachmentAtomicNumbers(ocl).r3,
      rank: rankOf(ocl, atomicNo),
    });
  }

  const map = molecule.addMolecule(fragment);
  return local
    .toSorted((first, second) => first.rank - second.rank)
    .map(({ point, anchor, sideChain }) => ({
      point: map[point] as number,
      anchor: map[anchor] as number,
      sideChain,
    }));
}

/**
 * The order the chain consumes attachment points in.
 *
 * `R1` faces the previous fragment and `R2` the next one, so they lead. A
 * generic `R` comes next, which is what keeps a protecting group's site from
 * ever carrying the backbone. `R3` is last: it is the side chain, and the
 * parentheses that fill it are read after the chain is bonded.
 * @param ocl - openchemlib.
 * @param atomicNo - atomic number of the pseudo atom.
 * @returns its rank, lowest first.
 */
function rankOf(ocl: OCL, atomicNo: number): number {
  const attachments = getAttachmentAtomicNumbers(ocl);
  if (atomicNo === attachments.r1) return 0;
  if (atomicNo === attachments.r2) return 1;
  if (atomicNo === attachments.r3) return 3;
  return 2;
}
