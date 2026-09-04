import { InputGroup } from '@blueprintjs/core';

export interface NotationBarProps {
  /** What the input holds. */
  notation: string;
  /** Called on every keystroke with the new notation. */
  onNotation: (notation: string) => void;
}

/**
 * The notation input.
 * @param props - The notation and the setter called on every keystroke.
 * @returns The row holding the notation input.
 */
export function NotationBar(props: NotationBarProps) {
  const { notation, onNotation } = props;
  return (
    <div className="notation-bar">
      <InputGroup
        size="large"
        fill
        autoComplete="off"
        autoCapitalize="off"
        autoCorrect="off"
        spellCheck={false}
        placeholder="HAlaGlyOH"
        value={notation}
        onValueChange={onNotation}
      />
    </div>
  );
}
