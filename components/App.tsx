import { useMemo, useState } from 'react';
import type { SiteAdapter } from '../adapters/types';
import { buildReadout } from '../core/readout';
import { getTrackingState } from '../core/status';
import { countFor } from '../core/tokenizer';
import { useFocusState } from '../lib/use-focus-state';
import { useModel } from '../lib/use-model';
import { usePromptText } from '../lib/use-prompt-text';
import { Card } from './Card';
import { FloatingShell } from './FloatingShell';
import { Pill } from './Pill';
import './Card.css';

export function App({ adapter }: { adapter: SiteAdapter }) {
  const [paused, setPaused] = useState(false);
  const [collapsed, setCollapsed] = useState(false);

  const focus = useFocusState(adapter);
  const state = getTrackingState({ paused, ...focus });
  const text = usePromptText(adapter, state === 'tracking');
  const { model, models, canPick, choose } = useModel(adapter);
  const readout = useMemo(() => buildReadout(countFor(model, text), model), [model, text]);

  return (
    <FloatingShell onTap={collapsed ? () => setCollapsed(false) : undefined}>
      {collapsed ? (
        <Pill readout={readout} state={state} onExpand={() => setCollapsed(false)} />
      ) : (
        <Card
          readout={readout}
          state={state}
          source={adapter.name}
          model={model}
          models={models}
          canPick={canPick}
          onPick={choose}
          paused={paused}
          onTogglePause={() => setPaused((p) => !p)}
          onCollapse={() => setCollapsed(true)}
        />
      )}
    </FloatingShell>
  );
}
