import { useState } from 'react';
import { formatCompact, formatCost, formatPercent } from '../core/format';
import type { ModelInfo } from '../core/models';
import type { Readout } from '../core/readout';
import type { TrackingState } from '../core/status';
import { MinusIcon, PauseIcon, PlayIcon } from './icons';
import { Meter } from './Meter';
import type { MeterTone } from './Meter';
import { ModelChip } from './ModelChip';
import { ModelPicker } from './ModelPicker';
import { StatusLine } from './StatusLine';

const COST_TIP = 'API-equivalent estimate, excludes hidden thinking and system prompt';

interface CardProps {
  readout: Readout;
  state: TrackingState;
  /** Site name for the status line, for example "ChatGPT". */
  source: string;
  model: ModelInfo | null;
  models: ModelInfo[];
  canPick: boolean;
  onPick: (model: ModelInfo) => void;
  paused: boolean;
  onTogglePause: () => void;
  onCollapse: () => void;
}

export function Card({
  readout,
  state,
  source,
  model,
  models,
  canPick,
  onPick,
  paused,
  onTogglePause,
  onCollapse,
}: CardProps) {
  const [pickerOpen, setPickerOpen] = useState(false);
  const live = state === 'tracking';
  const tone: MeterTone = live && readout.level ? readout.level : 'idle';
  const unit = live ? (readout.hint ?? 'tokens in your prompt') : 'last count · not live';

  return (
    <section className={`card${live ? '' : ' dim'}`} aria-label="Tictic Tokn token meter">
      <div className="card-header" data-drag="">
        <ModelChip model={model} canPick={canPick} open={pickerOpen} onToggle={() => setPickerOpen((o) => !o)} />
        <div className="actions">
          <button type="button" className="icon-btn" aria-label="Collapse to pill" onClick={onCollapse}>
            <MinusIcon />
          </button>
          <button
            type="button"
            className="pause-btn"
            aria-label={paused ? 'Resume capture' : 'Pause capture'}
            onClick={onTogglePause}
          >
            {paused ? <PlayIcon /> : <PauseIcon />}
          </button>
        </div>
      </div>

      {pickerOpen && (
        <ModelPicker
          models={models}
          selectedId={model?.id ?? null}
          onSelect={(m) => {
            onPick(m);
            setPickerOpen(false);
          }}
          onClose={() => setPickerOpen(false)}
        />
      )}

      <div className={`count${live && readout.level && readout.level !== 'ok' ? ` count--${readout.level}` : ''}`}>
        {readout.tokens.toLocaleString('en-US')}
      </div>
      <div className="unit">{unit}</div>
      <Meter ratio={readout.ratio ?? 0} tone={tone} />

      <div className="footer">
        {readout.cost === null || readout.contextWindow === null || readout.ratio === null ? (
          <>
            <span>est.</span>
            <span>pick a model</span>
          </>
        ) : (
          <>
            <span title={COST_TIP}>
              <b>{formatCost(readout.cost)}</b> {readout.exact ? 'input' : 'est.'}
            </span>
            <span>
              <b>{formatPercent(readout.ratio)}</b> of {formatCompact(readout.contextWindow)}
            </span>
          </>
        )}
      </div>

      <StatusLine state={state} source={source} />
    </section>
  );
}
