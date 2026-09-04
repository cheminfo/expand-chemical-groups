import type { Molecule } from 'openchemlib';

import type { OCL } from '../expandChemicalGroups.ts';

import { assertNoAttachmentLeft } from './attachmentPoints.ts';
import { getFragment } from './getFragment.ts';
import type { SequenceToken } from './parseGroupNotation.ts';
import type { AttachmentPoint } from './placeFragment.ts';
import { placeFragment } from './placeFragment.ts';

/**
 * Build one strand from its tokens, condensing each fragment onto the last.
 *
 * Every token of the notation is a structure carrying attachment points, the
 * elements included — `H` is `H-R` and `O` is `R1-O-R2` — so the whole strand
 * is one operation repeated: drop the two attachment points that face each
 * other and bond the atoms they sat on. A point nothing is condensed onto is
 * removed, which leaves its atom the hydrogen it was drawn without, so
 * `HAlaGlyOH` and `AlaGlyO` build the same dipeptide. A triradical residue such
 * as `Cysp` carries an `R3` that the parentheses after it fill.
 * @param ocl - openchemlib.
 * @param tokens - the tokens of a single strand.
 * @returns the molecule of the strand.
 */
export function buildStrand(ocl: OCL, tokens: SequenceToken[]): Molecule {
  const { Molecule } = ocl;
  const molecule = new Molecule(0, 0);
  const spent: number[] = [];
  let free: AttachmentPoint[] = [];
  let previous = '';

  for (const token of tokens) {
    const points = placeFragment(molecule, getFragment(ocl, token.symbol));
    const incoming = points.shift();
    if (incoming === undefined) {
      throw new Error(
        `the group ${token.symbol} has no attachment point in chemical-groups`,
      );
    }

    const open = free.shift();
    if (open === undefined) {
      if (previous !== '') {
        throw new Error(
          `the group ${token.symbol} cannot be bonded to ${previous}`,
        );
      }
      // The first fragment has no neighbour on its left, so the `R1` facing
      // that side is the dangling end of the strand and the next fragment
      // condenses onto the `R2` behind it. A fragment carrying a single point
      // faces right with it instead, which is what a leading `H` does.
      if (points.length === 0) points.push(incoming);
      else spent.push(incoming.point);
    } else {
      molecule.addBond(open.anchor, incoming.anchor);
      spent.push(open.point, incoming.point);
    }

    if (token.sideChain !== undefined) {
      bondSideChain(ocl, molecule, points, token, spent);
    }

    free = [...free, ...points];
    previous = token.symbol;
  }

  for (const point of free) spent.push(point.point);
  molecule.deleteAtoms(spent);
  assertNoAttachmentLeft(molecule);
  return molecule;
}

/**
 * Fill the `R3` of a triradical residue with the group written in parentheses.
 * @param ocl - openchemlib.
 * @param molecule - the strand being built.
 * @param points - the points the residue has left, its `R3` last.
 * @param token - the token of the residue.
 * @param spent - points to remove once the strand is complete.
 */
function bondSideChain(
  ocl: OCL,
  molecule: Molecule,
  points: AttachmentPoint[],
  token: SequenceToken,
  spent: number[],
) {
  const index = points.findIndex((point) => point.sideChain);
  const site = points[index];
  if (site === undefined) {
    throw new Error(
      `the group ${token.symbol} has no side chain to bond ${token.sideChain} to`,
    );
  }
  points.splice(index, 1);
  const sideChain = placeFragment(
    molecule,
    getFragment(ocl, token.sideChain as string),
  );
  const attachment = sideChain[0];
  if (sideChain.length !== 1 || attachment === undefined) {
    throw new Error(
      `the side chain of ${token.symbol} cannot be built: the group ${token.sideChain} has ${sideChain.length} attachment points`,
    );
  }
  molecule.addBond(site.anchor, attachment.anchor);
  spent.push(site.point, attachment.point);
}
