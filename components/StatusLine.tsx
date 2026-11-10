import type { TrackingState } from '../core/status';
import { DotIcon, PadlockIcon, PauseIcon, RingIcon } from './icons';

const WORD: Record<TrackingState, string> = {
  tracking: 'Tracking',
  paused: 'Paused',
  'not-tracking': 'Not tracking',
  ignoring: 'Ignoring',
};

function detail(state: TrackingState, source: string): string {
  switch (state) {
    case 'tracking':
      return `${source} prompt box`;
    case 'paused':
      return 'capture is off';
    case 'not-tracking':
      return 'focus is outside the prompt box';
    case 'ignoring':
      return 'password or payment field';
  }
}

/** The icon for a state; shape differs per state so colour is never the only signal. */
export function StatusIcon({ state }: { state: TrackingState }) {
  switch (state) {
    case 'tracking':
      return <DotIcon className="status-icon status-icon--ok" />;
    case 'paused':
      return <PauseIcon className="status-icon status-icon--warn" />;
    case 'not-tracking':
      return <RingIcon className="status-icon status-icon--idle" />;
    case 'ignoring':
      return <PadlockIcon className="status-icon status-icon--muted" />;
  }
}

export function StatusLine({ state, source }: { state: TrackingState; source: string }) {
  return (
    <div className="status" aria-live="polite">
      <StatusIcon state={state} />
      <span>
        <b>{WORD[state]}</b> · {detail(state, source)}
      </span>
    </div>
  );
}
