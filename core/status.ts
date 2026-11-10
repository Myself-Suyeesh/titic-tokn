export type TrackingState = 'tracking' | 'paused' | 'not-tracking' | 'ignoring';

export interface TrackingInput {
  /** The user pressed pause. */
  paused: boolean;
  /** A password or payment field has focus. */
  secureFocused: boolean;
  /** Focus is in the site's prompt box. */
  promptFocused: boolean;
}

/**
 * The four states from design.md. Priority: Paused, Ignoring, Not tracking,
 * Tracking. Only Tracking reads the page.
 */
export function getTrackingState({ paused, secureFocused, promptFocused }: TrackingInput): TrackingState {
  if (paused) return 'paused';
  if (secureFocused) return 'ignoring';
  if (!promptFocused) return 'not-tracking';
  return 'tracking';
}
