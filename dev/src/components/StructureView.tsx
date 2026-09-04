import { NonIdealState } from '@blueprintjs/core';
import type { Molecule, MoleculeToSVGOptions } from 'openchemlib';
import { useMemo } from 'react';
import { MolfileSvgRenderer } from 'react-ocl';

export interface StructureViewProps {
  /** The molecule to draw, `null` when nothing has expanded yet. */
  molecule: Molecule | null;
  /** How the depictor draws it, as derived by `displayMolecule`. */
  depictorOptions: MoleculeToSVGOptions;
  /** `true` when the drawing is older than the notation in the input. */
  stale: boolean;
}

/**
 * The molecule the notation expanded to.
 *
 * The drawing goes through a V2000 molfile, which carries the atom custom
 * labels the pro-R / pro-S view writes.
 * @param props - the molecule, how to draw it, and whether it is stale.
 * @returns The drawing of the molecule.
 */
export function StructureView(props: StructureViewProps) {
  const { molecule, depictorOptions, stale } = props;
  const molfile = useMemo(() => molecule?.toMolfile() ?? '', [molecule]);

  if (molfile === '') {
    return (
      <NonIdealState
        icon="graph"
        title="Nothing to draw"
        description="No notation has expanded yet."
      />
    );
  }

  return (
    <div className={stale ? 'structure structure--stale' : 'structure'}>
      <MolfileSvgRenderer
        {...depictorOptions}
        molfile={molfile}
        width={560}
        height={420}
        autoCrop
        autoCropMargin={16}
      />
    </div>
  );
}
