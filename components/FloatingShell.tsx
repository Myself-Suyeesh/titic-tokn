import { useRef, useState } from 'react';
import type { CSSProperties, PointerEvent, ReactNode } from 'react';

interface FloatingShellProps {
  children: ReactNode;
  /** Called for a press-and-release (no drag) on an element marked `data-tap`. */
  onTap?: () => void;
}

interface Grab {
  dx: number;
  dy: number;
  startX: number;
  startY: number;
  moved: boolean;
  tap: boolean;
}

const DRAG_THRESHOLD = 4;

/**
 * Fixed-position wrapper that can be dragged by any element marked `data-drag`
 * (buttons are skipped unless they are marked too). Never takes focus from the page.
 */
export function FloatingShell({ children, onTap }: FloatingShellProps) {
  const ref = useRef<HTMLDivElement>(null);
  const grab = useRef<Grab | null>(null);
  const [position, setPosition] = useState<{ left: number; top: number } | null>(null);

  const onPointerDown = (e: PointerEvent<HTMLDivElement>) => {
    const target = e.target as HTMLElement;
    if (!target.closest('[data-drag]')) return;
    const button = target.closest('button');
    if (button && !button.hasAttribute('data-drag')) return;
    const rect = e.currentTarget.getBoundingClientRect();
    grab.current = {
      dx: e.clientX - rect.left,
      dy: e.clientY - rect.top,
      startX: e.clientX,
      startY: e.clientY,
      moved: false,
      tap: target.closest('[data-tap]') !== null,
    };
    e.currentTarget.setPointerCapture(e.pointerId);
    e.preventDefault(); // keep focus in the page's prompt box
  };

  const onPointerMove = (e: PointerEvent<HTMLDivElement>) => {
    const g = grab.current;
    const el = ref.current;
    if (!g || !el) return;
    if (!g.moved && Math.hypot(e.clientX - g.startX, e.clientY - g.startY) < DRAG_THRESHOLD) return;
    g.moved = true;
    setPosition({
      left: Math.min(Math.max(0, e.clientX - g.dx), Math.max(0, window.innerWidth - el.offsetWidth)),
      top: Math.min(Math.max(0, e.clientY - g.dy), Math.max(0, window.innerHeight - el.offsetHeight)),
    });
  };

  const endGrab = (e: PointerEvent<HTMLDivElement>) => {
    const g = grab.current;
    grab.current = null;
    if (g && e.type === 'pointerup' && !g.moved && g.tap) onTap?.();
  };

  const style: CSSProperties | undefined = position
    ? { left: position.left, top: position.top, right: 'auto', bottom: 'auto' }
    : undefined;

  return (
    <div
      ref={ref}
      className="shell"
      style={style}
      onMouseDown={(e) => e.preventDefault()}
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={endGrab}
      onPointerCancel={endGrab}
    >
      {children}
    </div>
  );
}
