import type { ReactNode } from 'react';

interface Props {
  front: ReactNode;
  back: ReactNode;
  flipped: boolean;
  onFlip: () => void;
}

/** A card that turns over with a 3D flip when tapped. */
export function FlipCard({ front, back, flipped, onFlip }: Props) {
  return (
    <button
      type="button"
      className={`flip-card${flipped ? ' is-flipped' : ''}`}
      onClick={onFlip}
      aria-label={flipped ? 'Show front' : 'Show back'}
      aria-pressed={flipped}
    >
      <div className="flip-inner">
        <div className="flip-face flip-front" aria-hidden={flipped}>
          {front}
        </div>
        <div className="flip-face flip-back" aria-hidden={!flipped}>
          {back}
        </div>
      </div>
    </button>
  );
}
