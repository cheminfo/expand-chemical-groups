import { Callout, Card, Navbar } from '@blueprintjs/core';
import { useMemo, useState } from 'react';

import { DisplayToggles } from './components/DisplayToggles.tsx';
import { ExampleRow } from './components/ExampleRow.tsx';
import { NotationBar } from './components/NotationBar.tsx';
import { OutputPanel } from './components/OutputPanel.tsx';
import { PropertiesPanel } from './components/PropertiesPanel.tsx';
import { StructureView } from './components/StructureView.tsx';
import type { DisplayOptions } from './displayMolecule.ts';
import { DEFAULT_DISPLAY_OPTIONS, displayMolecule } from './displayMolecule.ts';
import { useNotationSession } from './useNotationSession.ts';

/**
 * The whole playground: a notation goes in, the molecule it builds comes out.
 * @returns The page.
 */
export function App() {
  const session = useNotationSession();
  const [display, setDisplay] = useState<DisplayOptions>(
    DEFAULT_DISPLAY_OPTIONS,
  );

  const shownMolecule = session.shown;
  const drawn = useMemo(
    () => (shownMolecule ? displayMolecule(shownMolecule, display) : null),
    [shownMolecule, display],
  );

  return (
    <div className="page">
      <Navbar>
        <Navbar.Group>
          <Navbar.Heading>expand-chemical-groups</Navbar.Heading>
          <Navbar.Divider />
          <span className="page__tagline">
            Type a notation, read the molecule it expands to.
          </span>
        </Navbar.Group>
      </Navbar>

      <main className="page__body">
        <Card className="panel">
          <NotationBar
            notation={session.notation}
            onNotation={session.setNotation}
          />
          <ExampleRow
            notation={session.notation}
            onSelect={session.setNotation}
          />
        </Card>

        {session.error === null ? null : (
          <Callout intent="danger" title="expandChemicalGroups threw">
            {session.error}
            {session.stale
              ? ' — the drawing below is the last notation that expanded.'
              : null}
          </Callout>
        )}

        <div className="page__columns">
          <Card className="panel">
            <DisplayToggles options={display} onChange={setDisplay} />
            <StructureView
              molecule={drawn?.molecule ?? null}
              depictorOptions={drawn?.depictorOptions ?? {}}
              stale={session.stale}
            />
          </Card>

          <div className="page__side">
            {session.shown === null ? null : (
              <>
                <Card className="panel">
                  <PropertiesPanel molecule={session.shown} />
                </Card>
                <Card className="panel">
                  <OutputPanel molecule={session.shown} />
                </Card>
              </>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
