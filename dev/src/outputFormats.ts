import type { Molecule } from 'openchemlib';

/** Which serialization the output panel shows. */
export type OutputFormat = 'molfile' | 'molfileV3' | 'smiles' | 'idcode';

export interface OutputFormatOption {
  /** What the segmented control writes on the segment. */
  label: string;
  /** The format that segment selects. */
  value: OutputFormat;
}

/**
 * Serialize a molecule in one of the formats the output panel offers.
 * @param molecule - the molecule the notation expanded to.
 * @param format - the serialization to produce.
 * @returns The molecule written in that format.
 */
export function writeMolecule(
  molecule: Molecule,
  format: OutputFormat,
): string {
  return WRITERS[format](molecule);
}

/**
 * Read the format back from the value a segmented control reports.
 * @param value - the raw value of the control.
 * @returns The matching format, `molfile` for anything else.
 */
export function toOutputFormat(value: string): OutputFormat {
  const known = OUTPUT_FORMAT_OPTIONS.find((option) => option.value === value);
  return known ? known.value : 'molfile';
}

const WRITERS: Record<OutputFormat, (molecule: Molecule) => string> = {
  molfile: (molecule) => molecule.toMolfile(),
  molfileV3: (molecule) => molecule.toMolfileV3(),
  smiles: (molecule) => molecule.toIsomericSmiles(),
  idcode: (molecule) => molecule.getIDCode(),
};

/** The formats the output panel offers, in the order it shows them. */
export const OUTPUT_FORMAT_OPTIONS: OutputFormatOption[] = [
  { label: 'Molfile V2000', value: 'molfile' },
  { label: 'Molfile V3000', value: 'molfileV3' },
  { label: 'SMILES', value: 'smiles' },
  { label: 'ID code', value: 'idcode' },
];
