import { Button, SegmentedControl } from '@blueprintjs/core';
import type { Molecule } from 'openchemlib';
import { useMemo, useState } from 'react';

import type { OutputFormat } from '../outputFormats.ts';
import {
  OUTPUT_FORMAT_OPTIONS,
  toOutputFormat,
  writeMolecule,
} from '../outputFormats.ts';
import { useCopyToClipboard } from '../useCopyToClipboard.ts';

const COPY_LABEL = {
  idle: 'Copy',
  copied: 'Copied',
  failed: 'Copy refused',
};

export interface OutputPanelProps {
  /** The molecule to serialize. */
  molecule: Molecule;
}

/**
 * The molecule written as a molfile, a SMILES, or an ID code.
 * @param props - the molecule to serialize.
 * @returns The panel holding the format switch, the text, and the copy button.
 */
export function OutputPanel(props: OutputPanelProps) {
  const { molecule } = props;
  const [format, setFormat] = useState<OutputFormat>('molfile');
  const { status, copy } = useCopyToClipboard();

  const text = useMemo(
    () => writeMolecule(molecule, format),
    [molecule, format],
  );

  return (
    <div className="output">
      <div className="output__bar">
        <SegmentedControl
          size="small"
          value={format}
          onValueChange={(value) => {
            setFormat(toOutputFormat(value));
          }}
          options={OUTPUT_FORMAT_OPTIONS}
        />
        <Button
          size="small"
          icon="clipboard"
          intent={status === 'failed' ? 'danger' : undefined}
          text={COPY_LABEL[status]}
          onClick={() => {
            void copy(text);
          }}
        />
      </div>
      <pre className="output__text">{text}</pre>
    </div>
  );
}
