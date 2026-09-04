import type { Group } from 'chemical-groups';
import { groups } from 'chemical-groups';
import * as OCL from 'openchemlib';
import { expect, test } from 'vitest';

import { expandChemicalGroups } from '../expandChemicalGroups.ts';
import { listAttachmentPoints } from '../utils/attachmentPoints.ts';
import { getFragment } from '../utils/getFragment.ts';

/**
 * Every group of `chemical-groups`, put in the chain it is made for, must
 * either give one whole molecule or say why it cannot: an attachment point
 * that reaches the molfile, or a strand that fell apart, is a silent wrong
 * answer. The groups that are rejected are pinned symbol by symbol, so a
 * change in what the package can build shows up in the diff.
 */

/** The groups that cannot be built today, with the reason each one gives. */
const REJECTED = [
  'Pqb: the group Pqb has no attachment point in chemical-groups',
  'Pqg: the group Pqg has no attachment point in chemical-groups',
  'Qba: the group Qba has no attachment point in chemical-groups',
  'Xle: unknown group in sequence: Xle',
];

test('every group either builds one whole molecule or is rejected by name', () => {
  const rejected: string[] = [];
  const leftover: string[] = [];
  const split: string[] = [];
  let built = 0;

  for (const group of groups) {
    const notation = probeNotation(group);
    let molecule;
    try {
      molecule = expandChemicalGroups(OCL, notation);
    } catch (error) {
      rejected.push(`${group.symbol}: ${(error as Error).message}`);
      continue;
    }
    built++;
    for (const atom of listAttachmentPoints(molecule)) {
      leftover.push(`${notation}: ${molecule.getAtomLabel(atom)}`);
    }
    const fragments = molecule.getFragments().length;
    if (fragments !== 1) split.push(`${notation}: ${fragments} fragments`);
  }

  expect(leftover).toStrictEqual([]);
  expect(split).toStrictEqual([]);
  expect(rejected.toSorted()).toStrictEqual(REJECTED);
  expect(groups).toHaveLength(304);
  expect(built).toBe(300);
});

/**
 * The shortest chain that exercises a group, read from its own structure: a
 * group carrying a single attachment point can only cap an alanine, anything
 * else takes the free terminals a chain unit is made for.
 * @param group - the group to probe.
 * @returns the notation to expand.
 */
function probeNotation(group: Group): string {
  let points: number;
  try {
    points = listAttachmentPoints(getFragment(OCL, group.symbol)).length;
  } catch {
    return `H${group.symbol}OH`;
  }
  return points === 1 ? `${group.symbol}AlaOH` : `H${group.symbol}OH`;
}
