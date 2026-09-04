import type { Molecule } from 'openchemlib';
import { MF } from 'react-mf';

export interface PropertiesPanelProps {
  /** The molecule to describe. */
  molecule: Molecule;
}

/**
 * The formula, the weights, and the size of the molecule.
 * @param props - the molecule to describe.
 * @returns The table of molecular properties.
 */
export function PropertiesPanel(props: PropertiesPanelProps) {
  const { molecule } = props;
  const formula = molecule.getMolecularFormula();

  return (
    <dl className="properties">
      <dt>Formula</dt>
      <dd>
        <MF mf={formula.formula} />
      </dd>
      <dt>Monoisotopic mass</dt>
      <dd>{formula.absoluteWeight.toFixed(6)}</dd>
      <dt>Average mass</dt>
      <dd>{formula.relativeWeight.toFixed(4)}</dd>
      <dt>Atoms</dt>
      <dd>{molecule.getAllAtoms()}</dd>
      <dt>Fragments</dt>
      <dd>{molecule.getFragments().length}</dd>
    </dl>
  );
}
