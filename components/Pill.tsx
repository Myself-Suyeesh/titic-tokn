import type { Readout } from '../core/readout';
import type { TrackingState } from '../core/status';
import { CircleMarker, SquareMarker, TriangleMarker } from './icons';
import { StatusIcon } from './StatusLine';

interface PillProps {
  readout: Readout;
  state: TrackingState;
  onExpand: () => void;
}

function Marker({ readout, state }: Pick<PillProps, 'readout' | 'state'>) {
  if (state !== 'tracking') return <StatusIcon state={state} />;
  switch (readout.level) {
    case 'warn':
      return <TriangleMarker className="marker marker--warn" />;
    case 'danger':
      return <SquareMarker className="marker marker--danger" />;
    case 'ok':
      return <CircleMarker className="marker marker--ok" />;
    case null:
      return <CircleMarker className="marker marker--idle" />;
  }
}

/** Collapsed card. Mouse clicks are handled by FloatingShell (so a drag is not a click); this handles the keyboard. */
export function Pill({ readout, state, onExpand }: PillProps) {
  return (
    <button
      type="button"
      className={`pill${state === 'tracking' ? '' : ' dim'}`}
      aria-label="Expand token meter"
      data-drag=""
      data-tap=""
      onClick={(event) => {
        if (event.detail === 0) onExpand();
      }}
    >
      <Marker readout={readout} state={state} />
      <span className="pill-count">{readout.tokens.toLocaleString('en-US')}</span>
    </button>
  );
}
