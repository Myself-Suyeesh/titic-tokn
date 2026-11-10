import { useRef, useState } from 'react';
import type { CSSProperties, PointerEvent } from 'react';
import './Card.css';

interface CardProps {
  tokens: number;
}

interface Position {
  left: number;
  top: number;
}

export function Card({ tokens }: CardProps) {
  const cardRef = useRef<HTMLElement>(null);
  const grab = useRef<{ dx: number; dy: number } | null>(null);
  const [position, setPosition] = useState<Position | null>(null);

  const onPointerDown = (e: PointerEvent<HTMLElement>) => {
    const card = cardRef.current;
    if (!card) return;
    const rect = card.getBoundingClientRect();
    grab.current = { dx: e.clientX - rect.left, dy: e.clientY - rect.top };
    e.currentTarget.setPointerCapture(e.pointerId);
    e.preventDefault(); // keep focus in the page's prompt box
  };

  const onPointerMove = (e: PointerEvent<HTMLElement>) => {
    const card = cardRef.current;
    if (!grab.current || !card) return;
    const maxLeft = window.innerWidth - card.offsetWidth;
    const maxTop = window.innerHeight - card.offsetHeight;
    setPosition({
      left: Math.min(Math.max(0, e.clientX - grab.current.dx), Math.max(0, maxLeft)),
      top: Math.min(Math.max(0, e.clientY - grab.current.dy), Math.max(0, maxTop)),
    });
  };

  const onPointerUp = () => {
    grab.current = null;
  };

  const style: CSSProperties | undefined = position
    ? { left: position.left, top: position.top, right: 'auto', bottom: 'auto' }
    : undefined;

  return (
    <section
      ref={cardRef}
      className="card"
      style={style}
      aria-label="Tictic Tokn token meter"
      onMouseDown={(e) => e.preventDefault()}
    >
      <div
        className="card-header"
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onPointerCancel={onPointerUp}
      >
        {/* Placeholder until model detection lands in milestone 2. */}
        <span className="chip">GPT-4o · exact</span>
      </div>
      <div className="count">{tokens.toLocaleString('en-US')}</div>
      <div className="unit">tokens in your prompt</div>
    </section>
  );
}
