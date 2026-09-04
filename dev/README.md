# expand-chemical-groups-dev

The playground for [`expand-chemical-groups`](../README.md). Type a notation,
see the molecule it builds — that is the fastest way to find out why a notation
gives something you did not expect.

It is a local development workspace. It is never published, and it is not part
of the package.

## Start it

From the repository root:

```console
npm install
npm run dev
```

It opens on <http://localhost:10828>. The port is fixed, so a second checkout
fails loudly instead of drifting to another one.

## What the page shows

Enter a notation such as `HAlaGlyOH`, `MeAlaGlyProPh` or `HODampDcmpH` and the
page reports, live:

- the molecule, drawn;
- its molecular formula, its masses, and how many fragments it holds;
- the molfile and the SMILES the molecule writes.

An unknown group or an empty notation shows the error the package throws, in
place of the drawing.

## It runs the sources

`vite.config.ts` aliases `expand-chemical-groups` to `../src/index.ts`, and
`tsconfig.json` maps the same path for type-checking. So the playground runs the
library sources directly: nothing has to be built first, and an edit in `src` is
hot reloaded here.

Type-check it with `npm run check-types` from the repository root, which covers
both the library and this workspace.
