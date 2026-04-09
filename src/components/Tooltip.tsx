import { useState, useRef, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { Info } from 'lucide-react';

interface TooltipProps {
  content: React.ReactNode;
  children?: React.ReactNode;
  large?: boolean;
  className?: string;
}

interface Pos { top: number; left: number; above: boolean }

function TooltipPortal({ content, pos, large }: { content: React.ReactNode; pos: Pos; large: boolean }) {
  const style: React.CSSProperties = pos.above
    ? { position: 'fixed', zIndex: 99999, bottom: window.innerHeight - pos.top + 10, left: pos.left, transform: 'translateX(-50%)' }
    : { position: 'fixed', zIndex: 99999, top: pos.top + 10, left: pos.left, transform: 'translateX(-50%)' };

  return createPortal(
    <div style={style} className={`tip-box ${large ? 'tip-large' : ''} ${pos.above ? '' : 'tip-below'}`}>
      {content}
    </div>,
    document.body
  );
}

export function Tooltip({ content, children, large = false, className = '' }: TooltipProps) {
  const [pos, setPos] = useState<Pos | null>(null);
  const ref = useRef<HTMLSpanElement>(null);

  const show = useCallback(() => {
    if (!ref.current) return;
    const r = ref.current.getBoundingClientRect();
    const above = r.top > 160;
    setPos({ top: above ? r.top : r.bottom, left: r.left + r.width / 2, above });
  }, []);

  const hide = useCallback(() => setPos(null), []);

  return (
    <span ref={ref} className={`tip-wrap ${className}`} onMouseEnter={show} onMouseLeave={hide}>
      {children ?? <Info size={13} className="text-gray-400 cursor-default ml-0.5" />}
      {pos && <TooltipPortal content={content} pos={pos} large={large} />}
    </span>
  );
}

// ─── Tag Tooltip ──────────────────────────────────────────────────────────────

interface TagTooltipProps {
  label: string;
  type: 'msg' | 'angle' | 'icp';
  content: React.ReactNode;
  onClick?: (e: React.MouseEvent) => void;
}

export function TagTooltip({ label, type, content, onClick }: TagTooltipProps) {
  const [pos, setPos] = useState<Pos | null>(null);
  const ref = useRef<HTMLSpanElement>(null);
  const typeClass = type === 'msg' ? 'tag-msg' : type === 'angle' ? 'tag-angle' : 'tag-icp';

  const show = useCallback(() => {
    if (!ref.current) return;
    const r = ref.current.getBoundingClientRect();
    const above = r.top > 160;
    setPos({ top: above ? r.top : r.bottom, left: r.left + 8, above });
  }, []);

  const hide = useCallback(() => setPos(null), []);

  return (
    <span
      ref={ref}
      className={`tag-btn ${typeClass}`}
      onMouseEnter={show}
      onMouseLeave={hide}
      onClick={onClick}
    >
      {label}
      {pos && createPortal(
        <div
          style={pos.above
            ? { position: 'fixed', zIndex: 99999, bottom: window.innerHeight - pos.top + 10, left: pos.left }
            : { position: 'fixed', zIndex: 99999, top: pos.top + 10, left: pos.left }
          }
          className="tip-box tip-right tip-large"
        >
          {content}
        </div>,
        document.body
      )}
    </span>
  );
}
