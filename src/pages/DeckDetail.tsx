import {
  closestCenter,
  DndContext,
  KeyboardSensor,
  MouseSensor,
  TouchSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from '@dnd-kit/core';
import { restrictToVerticalAxis, restrictToParentElement } from '@dnd-kit/modifiers';
import { SortableContext, sortableKeyboardCoordinates, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { useLiveQuery } from 'dexie-react-hooks';
import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { Sheet } from '../components/Sheet';
import { SortableCardRow } from '../components/SortableCardRow';
import { TopBar } from '../components/TopBar';
import { db, getDeckCards, saveCardOrder, type Card } from '../db';
import { arrayMove } from '../lib/reorder';

export function DeckDetail() {
  const { deckId = '' } = useParams();
  const navigate = useNavigate();
  const [studyOpen, setStudyOpen] = useState(false);

  const deck = useLiveQuery(() => db.decks.get(deckId), [deckId], null);
  const storedCards = useLiveQuery(() => getDeckCards(deckId), [deckId]);

  // Local copy so a drop shows instantly, before the database write finishes.
  const [cards, setCards] = useState<Card[]>([]);
  useEffect(() => {
    if (storedCards) setCards(storedCards);
  }, [storedCards]);

  const sensors = useSensors(
    useSensor(MouseSensor, { activationConstraint: { distance: 4 } }),
    useSensor(TouchSensor, { activationConstraint: { delay: 120, tolerance: 6 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  );

  const handleDragEnd = ({ active, over }: DragEndEvent) => {
    if (!over || active.id === over.id) return;
    const from = cards.findIndex((c) => c.id === active.id);
    const to = cards.findIndex((c) => c.id === over.id);
    if (from < 0 || to < 0) return;
    const next = arrayMove(cards, from, to);
    setCards(next);
    void saveCardOrder(next);
  };

  if (deck === undefined) {
    return (
      <div className="page">
        <TopBar title="Deck not found" backTo="/" backLabel="Decks" />
        <main className="content">
          <p className="muted">This deck doesn't exist anymore.</p>
        </main>
      </div>
    );
  }

  const hasCards = cards.length > 0;

  return (
    <div className="page">
      <TopBar title={deck?.name ?? ''} backTo="/" backLabel="Decks" />

      <main className="content">
        {storedCards && !hasCards && (
          <div className="empty">
            <div className="empty-art" aria-hidden>🃏</div>
            <p>No cards in this deck yet.</p>
            <p className="muted">Tap “Add card” to make your first one.</p>
          </div>
        )}
        {hasCards && (
          <>
            <p className="hint muted">Drag ⠿ to change the order. Tap a card to edit.</p>
            <DndContext
              sensors={sensors}
              collisionDetection={closestCenter}
              modifiers={[restrictToVerticalAxis, restrictToParentElement]}
              onDragEnd={handleDragEnd}
            >
              <SortableContext items={cards.map((c) => c.id)} strategy={verticalListSortingStrategy}>
                <ul className="card-list">
                  {cards.map((card, i) => (
                    <SortableCardRow key={card.id} card={card} index={i} />
                  ))}
                </ul>
              </SortableContext>
            </DndContext>
          </>
        )}
      </main>

      <footer className="bottombar bottombar-split">
        <Link to={`/deck/${deckId}/card/new`} className="btn">
          + Add card
        </Link>
        <button className="btn btn-primary" disabled={!hasCards} onClick={() => setStudyOpen(true)}>
          Study
        </button>
      </footer>

      <Sheet open={studyOpen} onClose={() => setStudyOpen(false)} title="Study order">
        <div className="stack">
          <button className="btn btn-primary" onClick={() => navigate(`/deck/${deckId}/study?mode=ordered`)}>
            In order
          </button>
          <button className="btn btn-primary" onClick={() => navigate(`/deck/${deckId}/study?mode=random`)}>
            Shuffle
          </button>
          <button className="btn" onClick={() => setStudyOpen(false)}>
            Cancel
          </button>
        </div>
      </Sheet>
    </div>
  );
}
