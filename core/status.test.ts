import { describe, expect, it } from 'vitest';
import { getTrackingState } from './status';

const base = { paused: false, secureFocused: false, promptFocused: true };

describe('getTrackingState', () => {
  it('tracks when focus is in the prompt box', () => {
    expect(getTrackingState(base)).toBe('tracking');
  });

  it('is not tracking when focus is elsewhere', () => {
    expect(getTrackingState({ ...base, promptFocused: false })).toBe('not-tracking');
  });

  it('ignores when a secure field has focus', () => {
    expect(getTrackingState({ ...base, promptFocused: false, secureFocused: true })).toBe('ignoring');
  });

  it('is paused whenever the user paused, whatever else is true', () => {
    expect(getTrackingState({ ...base, paused: true })).toBe('paused');
    expect(getTrackingState({ paused: true, secureFocused: true, promptFocused: false })).toBe('paused');
  });
});
