import type { MoleculeToSVGOptions } from 'openchemlib';
import { Molecule } from 'openchemlib';
import { TopicMolecule } from 'openchemlib-utils';

export interface DisplayOptions {
  /**
   * Draw every hydrogen explicitly.
   * @default false
   */
  expandHydrogens: boolean;
  /**
   * Draw the hydrogens borne by a stereocentre, and no other.
   * @default false
   */
  chiralHydrogens: boolean;
  /**
   * Draw the CIP descriptor next to every stereocentre.
   * @default false
   */
  showCIP: boolean;
  /**
   * Label the prochiral hydrogens with their pro-R / pro-S descriptor. Those
   * hydrogens have to be drawn to be labelled, so this expands them all.
   * @default false
   */
  showProchirality: boolean;
}

export interface DisplayMolecule {
  /** The molecule to hand to the renderer. Never the one the library returned. */
  molecule: Molecule;
  /** The depictor options that go with it, spread onto the renderer as props. */
  depictorOptions: MoleculeToSVGOptions;
}

/**
 * Derive the molecule a set of display toggles asks for, and the depictor
 * options that draw it.
 *
 * The molecule handed in is never touched: adding hydrogens, writing custom
 * labels and filling the helper arrays all mutate, so every branch works on a
 * compact copy. Hydrogens are appended after the heavy atoms, so an atom index
 * of the expanded molecule still addresses the same atom in the result.
 * @param molecule - The molecule the notation expanded to.
 * @param options - The state of the display toggles.
 * @returns The molecule to draw and the options to draw it with.
 */
export function displayMolecule(
  molecule: Molecule,
  options: DisplayOptions,
): DisplayMolecule {
  const drawn = options.showProchirality
    ? withProchiralLabels(molecule)
    : withHydrogens(molecule, options);

  if (options.showCIP) drawn.ensureHelperArrays(Molecule.cHelperCIP);

  return {
    molecule: drawn,
    depictorOptions: { suppressCIPParity: !options.showCIP },
  };
}

/**
 * Which hydrogen toggle a set of options actually acts on.
 *
 * The three hydrogen states overlap, so one wins: labelling the prochiral
 * hydrogens needs them all, and drawing them all already covers the
 * stereocentres.
 * @param options - The state of the display toggles.
 * @returns The hydrogens the drawing will show.
 */
export function hydrogenMode(
  options: DisplayOptions,
): 'none' | 'chiral' | 'all' {
  if (options.showProchirality || options.expandHydrogens) return 'all';
  return options.chiralHydrogens ? 'chiral' : 'none';
}

/** No toggle pressed: the molecule as the library built it. */
export const DEFAULT_DISPLAY_OPTIONS: DisplayOptions = {
  expandHydrogens: false,
  chiralHydrogens: false,
  showCIP: false,
  showProchirality: false,
};

function withHydrogens(molecule: Molecule, options: DisplayOptions): Molecule {
  const copy = molecule.getCompactCopy();
  if (options.expandHydrogens) {
    copy.addImplicitHydrogens();
    return copy;
  }
  if (!options.chiralHydrogens) return copy;

  copy.ensureHelperArrays(Molecule.cHelperCIP);
  // Collect before adding: every hydrogen added lengthens the atom list.
  const centers: number[] = [];
  const atoms = copy.getAllAtoms();
  for (let atom = 0; atom < atoms; atom++) {
    if (copy.isAtomStereoCenter(atom)) centers.push(atom);
  }
  for (const center of centers) {
    copy.addImplicitHydrogens(center);
  }
  return copy;
}

function withProchiralLabels(molecule: Molecule): Molecule {
  const topic = new TopicMolecule(molecule.getCompactCopy());
  topic.setProchiralHydrogenLabels();
  return topic.moleculeWithH;
}
