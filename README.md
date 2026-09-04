# expand-chemical-groups

[![NPM version][npm-image]][npm-url]
[![build status][ci-image]][ci-url]
[![Test coverage][codecov-image]][codecov-url]
[![npm download][download-image]][download-url]

Expand a [`chemical-groups`][chemical-groups] abbreviation such as `HAlaGlyOH`
to an openchemlib molecule, and to the molfile it writes.

## Installation

```console
npm i expand-chemical-groups
```

## Usage

```js
import { expandChemicalGroups } from 'expand-chemical-groups';

const molecule = expandChemicalGroups('HAlaGlyOH');

molecule.toMolfile(); // V2000
molecule.toMolfileV3(); // V3000
```

The molecule is a plain openchemlib `Molecule`, so every format openchemlib
writes is available on it:

```js
molecule.toIsomericSmiles(); // 'C[C@@H](C(NCC(O)=O)=O)N'
molecule.getIDCode(); // 'deeL@DhAgHheDXuUMFP@'
molecule.getAllAtoms(); // 10
molecule.getMolecularFormula().formula; // 'C5H10N2O3'
molecule.getMolecularFormula().relativeWeight; // 146.1454
```

## In a page that already has openchemlib

The npm entry point above brings its own openchemlib. A browser bundle built
from `expandChemicalGroups` leaves the library out and takes it as the first
argument, so a page that already loaded openchemlib does not download a second
copy of it — 274 kB instead of 1.3 MB.

```html
<script src="openchemlib-full.js"></script>
<script src="expand-chemical-groups.umd.min.js"></script>
<script>
  const molecule = ExpandChemicalGroups.expandChemicalGroups(OCL, 'HAlaGlyOH');
  molecule.getMolecularFormula().formula; // 'C5H10N2O3'
</script>
```

## Any chain

The same call accepts every kind of chain: peptides, nucleic acids, and
anything `chemical-groups` describes.

```js
const molecule = expandChemicalGroups('HODampDcmpH');

molecule.getMolecularFormula().formula; // 'C19H26N8O12P2'
molecule.toMolfile(); // V2000
```

A notation holding several strands separated by a dot gives one molecule with
one fragment per strand: `HODampH.HODcmpH` builds two.

It throws `the notation is empty` on an empty or blank notation, and
`unknown group in sequence: Xyz` on a group `chemical-groups` does not know.

## The notation

The notation is the one the [`mass-tools`][mass-tools] packages speak.

| Notation          | What it builds                                   |
| ----------------- | ------------------------------------------------ |
| `HAlaGlyOH`       | the free Ala-Gly dipeptide                       |
| `HAlaGlyNH2`      | the same, as a C-terminal amide                  |
| `MeAlaGlyProPh`   | N-methyl, then Ala-Gly-Pro, then a phenyl ketone |
| `H(Ala)3GlyOH`    | parentheses and multipliers are expanded         |
| `HCysp(Ph)OH`     | S-phenylcysteine — `Ph` fills the `R3` of `Cysp` |
| `HODampDcmpH`     | a DNA dinucleotide, 5′-phosphate and 3′-hydroxyl |
| `HOAmpCmpH`       | the RNA equivalent                               |
| `HODampH.HODcmpH` | two strands, as two fragments of one molecule    |
| `HAlaGlyOAlaOH`   | a depsipeptide — the `O` links the two residues  |

Every chain unit of `chemical-groups` carries an `R1` on the side facing the
previous unit and an `R2` on the side facing the next one, whatever the
chemistry. Two consecutive units are therefore condensed the same way — drop the
two attachment points that face each other, bond the atoms they sat on — and
what differs between an amide and a phosphodiester is only which atoms those
are.

An element symbol is answered with a structure of the same kind, carrying one
attachment point per bond it can make: `H` is `H-R`, `O` is `R1-O-R2`, `N` is
`R1-N(-R2)-R3`. Nothing in the notation tells an element from a group — every
symbol is looked up and comes back as a structure — so an element condenses
exactly as a residue does, and a
terminal is not a special case — `…OH` is a carboxylic acid and `…NH2` an amide
for the same reason `…OMe` is an ester. An attachment point nothing is
condensed onto is removed, leaving its atom the hydrogen it was drawn without,
so `HAlaGlyOH` and `AlaGlyO` build the same dipeptide. That also means an
element is not confined to an end: `HAlaGlyOAlaOH` is a depsipeptide, and
`HAlaGlyOOH` a peroxide.

### Side chains

A triradical residue — `Cysp`, `Serp`, `Tyrp`, and the ten others `chemical-groups`
draws that way — carries a third attachment point, `R3`, on its side chain. Write
what hangs there in parentheses right after the residue:

```js
expandChemicalGroups('HCysp(Ph)OH').toIsomericSmiles();
// 'N[C@@H](CSc1ccccc1)C(O)=O'  — S-phenylcysteine
```

Parentheses name a side chain only after a residue that has an `R3` to fill;
after anything else they simply group a block of the chain, so `H(Ala)3GlyOH`
repeats an alanine and `HAla(Gly)OH` is `HAlaGlyOH`. A residue written without
them keeps the hydrogen it was drawn without, which makes `HCyspOH` the free
cysteine.

## One-letter and database sequences

They are not understood here. Convert them first, with the package that owns
that vocabulary, and pass the result:

```js
import { sequenceToMF } from 'peptide';
import { sequenceToMF as nucleicToMF } from 'nucleotide';
import { expandChemicalGroups } from 'expand-chemical-groups';

sequenceToMF('AGP'); // 'HAlaGlyProOH'
expandChemicalGroups(sequenceToMF('AGP')).getMolecularFormula().formula;
// 'C10H17N3O4'

nucleicToMF('ACGT', { kind: 'dna' }); // 'HODampDcmpDgmpDtmpH'
expandChemicalGroups(nucleicToMF('ACGT', { kind: 'dna' })).getFragments()
  .length;
// 1
```

Keeping the expanders out means this package depends only on `chemical-groups`
and `mf-parser`, and gains nothing it would have to keep in step with every
sequence format.

## Debugging a notation

Clone the repository and run the playground:

```console
npm install
npm run dev
```

It opens on <http://localhost:10828>. Type a notation and it draws the molecule
and reports the formula — which is the fastest way to see where a notation went
wrong. It runs the sources in `src`, so nothing has to be built first. See
[`dev/README.md`](./dev/README.md).

## [API Documentation](https://cheminfo.github.io/expand-chemical-groups/)

## License

[MIT](./LICENSE)

[npm-image]: https://img.shields.io/npm/v/expand-chemical-groups.svg
[npm-url]: https://www.npmjs.com/package/expand-chemical-groups
[ci-image]: https://github.com/cheminfo/expand-chemical-groups/workflows/Node.js%20CI/badge.svg?branch=main
[ci-url]: https://github.com/cheminfo/expand-chemical-groups/actions?query=workflow%3A%22Node.js+CI%22
[codecov-image]: https://img.shields.io/codecov/c/github/cheminfo/expand-chemical-groups.svg
[codecov-url]: https://codecov.io/gh/cheminfo/expand-chemical-groups
[download-image]: https://img.shields.io/npm/dm/expand-chemical-groups.svg
[download-url]: https://www.npmjs.com/package/expand-chemical-groups
[chemical-groups]: https://github.com/cheminfo/chemical-groups
[mass-tools]: https://github.com/cheminfo/mass-tools
