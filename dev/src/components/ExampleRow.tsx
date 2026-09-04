import { Button } from '@blueprintjs/core';

import { NOTATION_EXAMPLES } from '../examples.ts';

export interface ExampleRowProps {
  /** The notation currently in the input, shown as the pressed button. */
  notation: string;
  /** Called with the notation of the button that was pressed. */
  onSelect: (notation: string) => void;
}

/**
 * Buttons that fill the input with a notation known to expand.
 * @param props - the current notation and the handler that replaces it.
 * @returns The row of example buttons.
 */
export function ExampleRow(props: ExampleRowProps) {
  const { notation, onSelect } = props;
  return (
    <div className="example-row">
      {NOTATION_EXAMPLES.map((example) => (
        <Button
          key={example.notation}
          size="small"
          variant="minimal"
          active={example.notation === notation}
          title={example.hint}
          text={example.notation}
          onClick={() => {
            onSelect(example.notation);
          }}
        />
      ))}
    </div>
  );
}
