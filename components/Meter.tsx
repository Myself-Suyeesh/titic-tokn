export type MeterTone = 'ok' | 'warn' | 'danger' | 'idle';

interface MeterProps {
  /** Share of the context window, 0 to 1 (values above 1 fill the bar). */
  ratio: number;
  tone: MeterTone;
}

/** Segmented context bar. Segments widen with the state so colour is not the only signal. */
export function Meter({ ratio, tone }: MeterProps) {
  const percent = Math.min(Math.max(ratio, 0), 1) * 100;
  return (
    <div className={`meter meter--${tone}`} role="presentation">
      <div className="meter-fill" style={{ width: `${percent}%` }} />
    </div>
  );
}
