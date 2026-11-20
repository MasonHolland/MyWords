import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Link } from 'react-router-dom';
import type { Card } from '../db';
import { CardFront } from './CardFront';

interface Props {
  card: Card;
  index: number;
}

export function SortableCardRow({ card, index }: Props) {
  const { attributes, listeners, setNodeRef, setActivatorNodeRef, transform, transition, isDragging } =
    useSortable({ id: card.id });

  return (
    <li
      ref={setNodeRef}
      className={`card-row${isDragging ? ' is-dragging' : ''}`}
      style={{ transform: CSS.Transform.toString(transform), transition }}
    >
      <Link to={`/deck/${card.deckId}/card/${card.id}`} className="card-row-link">
        <span className="card-row-index">{index + 1}</span>
        <span className="card-row-front">
          <CardFront card={card} variant="thumb" />
        </span>
        <span className="card-row-back">{card.back}</span>
      </Link>
      <button
        type="button"
        ref={setActivatorNodeRef}
        className="drag-handle"
        aria-label={`Reorder card ${index + 1}`}
        {...attributes}
        {...listeners}
      >
        <svg width="20" height="20" viewBox="0 0 20 20" aria-hidden>
          <circle cx="7" cy="5" r="1.6" />
          <circle cx="13" cy="5" r="1.6" />
          <circle cx="7" cy="10" r="1.6" />
          <circle cx="13" cy="10" r="1.6" />
          <circle cx="7" cy="15" r="1.6" />
          <circle cx="13" cy="15" r="1.6" />
        </svg>
      </button>
    </li>
  );
}
