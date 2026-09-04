/** One notation the example row offers, with what it demonstrates. */
export interface NotationExample {
  /** The notation the button puts in the input. */
  notation: string;
  /** What this notation exercises, shown as the button title. */
  hint: string;
}

/** The notation the page opens on. */
export const DEFAULT_NOTATION = 'HAlaGlyOH';

/**
 * Notations the example row fills the input with. Every one of them expands
 * today, so a button that reports an error is a regression of the package.
 */
export const NOTATION_EXAMPLES: NotationExample[] = [
  {
    notation: 'HAlaGlyOH',
    hint: 'Two residues between an H and an OH terminal',
  },
  { notation: 'HAlaAlaGlyOH', hint: 'Three residues' },
  { notation: 'HAlaGlyNH2', hint: 'An amide C terminal' },
  {
    notation: 'MeAlaGlyProPh',
    hint: 'Caps: a methyl opens the chain, a phenyl closes it',
  },
  {
    notation: 'H(Ala)3GlyOH',
    hint: 'A multiplier repeating a residue three times',
  },
  { notation: 'HAlaLysArgOH', hint: 'Basic side chains' },
  {
    notation: 'HCysp(Ph)OH',
    hint: 'A phenyl in parentheses fills the R3 of a triradical residue',
  },
  {
    notation: 'HAlaCysp(Bzl)GlyOH',
    hint: 'The same R3, on a residue inside the chain',
  },
  {
    notation: 'HODampDcmpH',
    hint: 'A DNA dinucleotide',
  },
  { notation: 'HOAmpCmpH', hint: 'The RNA nucleotides' },
  {
    notation: 'HODampH.HODcmpH',
    hint: 'Two strands, so one molecule with two fragments',
  },
];
