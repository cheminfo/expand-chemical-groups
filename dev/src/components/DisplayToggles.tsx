import { Switch } from '@blueprintjs/core';

import type { DisplayOptions } from '../displayMolecule.ts';
import { hydrogenMode } from '../displayMolecule.ts';

export interface DisplayTogglesProps {
  /** Which views are switched on. */
  options: DisplayOptions;
  /** Called with the whole set of options every time one of them flips. */
  onChange: (options: DisplayOptions) => void;
}

/**
 * The switches that change how the molecule is drawn.
 *
 * The three hydrogen views overlap, so the switches say so: pro-R / pro-S is
 * read off explicit hydrogens and therefore holds `Expand H` down, and
 * `Expand H` already draws the hydrogens `Chiral H only` would.
 * @param props - the current options and the handler that replaces them.
 * @returns The row of display switches.
 */
export function DisplayToggles(props: DisplayTogglesProps) {
  const { options, onChange } = props;
  const hydrogens = hydrogenMode(options);

  return (
    <div className="display-toggles">
      <Switch
        inline
        label="Expand H"
        checked={hydrogens === 'all'}
        disabled={options.showProchirality}
        onChange={(event) => {
          onChange({ ...options, expandHydrogens: event.target.checked });
        }}
      />
      <Switch
        inline
        label="Chiral H only"
        checked={hydrogens === 'chiral'}
        disabled={hydrogens === 'all'}
        onChange={(event) => {
          onChange({ ...options, chiralHydrogens: event.target.checked });
        }}
      />
      <Switch
        inline
        label="R / S"
        checked={options.showCIP}
        onChange={(event) => {
          onChange({ ...options, showCIP: event.target.checked });
        }}
      />
      <Switch
        inline
        label="pro-R / pro-S"
        checked={options.showProchirality}
        onChange={(event) => {
          onChange({ ...options, showProchirality: event.target.checked });
        }}
      />
      {options.showProchirality ? (
        <span className="display-toggles__note">
          pro-R / pro-S is written on the hydrogens, so they are all drawn.
        </span>
      ) : null}
    </div>
  );
}
