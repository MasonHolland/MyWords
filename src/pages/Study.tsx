import { useCallback, useEffect, useState } from 'react';
import { Link, useParams, useSearchParams } from 'react-router-dom';
import { CardFront } from '../components/CardFront';
import { FlipCard } from '../components/FlipCard';
import { TopBar } from '../components/TopBar';
import { db, getDeckCards, type Card } from '../db';
import { shuffle } from '../lib/shuffle';

export function Study() {
  const { deckId = '' } = useParams();
  const [params] = useSearchParams();
  const random = params.get('mode') === 'random';
  const deckPath = `/deck/${deckId}`;

  const [deckName, setDeckName] = useState('');
  const [source, setSource] = useState<Card[]>();
  const [cards, setCards] = useState<Card[]>([]);
  const [index, setIndex] = useState(0);
  const [flipped, setFlipped] = useState(false);

  // Load once: the session order is fixed even if the deck changes elsewhere.
  useEffect(() => {
    let cancelled = false;
    Promise.all([db.decks.get(deckId), getDeckCards(deckId)]).then(([deck, loaded]) => {
      if (cancelled) return;
      setDeckName(deck?.name ?? '');
      setSource(loaded);
      setCards(random ? shuffle(loaded) : loaded);
    });
    return () => {
      cancelled = true;
    };
  }, [deckId, random]);

  const finished = source !== undefined && index >= cards.length;
  const card = cards[index];

  const go = useCallback(
    (delta: number) => {
      setFlipped(false);
      setIndex((i) => Math.max(0, Math.min(cards.length, i + delta)));
    },
    [cards.length],
  );

  const restart = (reshuffle: boolean) => {
    if (reshuffle && source) setCards(shuffle(source));
    setFlipped(false);
    setIndex(0);
  };

  // Keyboard support for desktop: space/enter flips, arrows move.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (finished) return;
      if (e.key === 'ArrowRight') go(1);
      else if (e.key === 'ArrowLeft') go(-1);
      else if (e.key === ' ' && e.target === document.body) {
        e.preventDefault();
        setFlipped((f) => !f);
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [go, finished]);

  return (
    <div className="page study">
      <TopBar
        title={deckName}
        backTo={deckPath}
        backLabel="Done"
        right={
          source && !finished ? (
            <span className="progress-count">
              {index + 1} / {cards.length}
            </span>
          ) : undefined
        }
      />

      {source && cards.length > 0 && (
        <div className="progress" aria-hidden>
          <div className="progress-bar" style={{ width: `${(Math.min(index + 1, cards.length) / cards.length) * 100}%` }} />
        </div>
      )}

      <main className="study-stage">
        {source && cards.length === 0 && (
          <div className="empty">
            <p>This deck has no cards.</p>
            <Link to={deckPath} className="btn">
              Back to deck
            </Link>
          </div>
        )}

        {card && !finished && (
          <>
            <FlipCard
              key={card.id + index}
              flipped={flipped}
              onFlip={() => setFlipped((f) => !f)}
              front={<CardFront card={card} variant="full" />}
              back={<span className="back-text">{card.back}</span>}
            />
            <p className="hint muted">{flipped ? 'Tap to see the front' : 'Tap the card to flip'}</p>
          </>
        )}

        {finished && cards.length > 0 && (
          <div className="finished">
            <div className="empty-art" aria-hidden>🎉</div>
            <h2>All done!</h2>
            <p className="muted">
              You went through {cards.length} {cards.length === 1 ? 'card' : 'cards'}.
            </p>
            <div className="stack">
              <button className="btn btn-primary" onClick={() => restart(false)}>
                Restart
              </button>
              <button className="btn" onClick={() => restart(true)}>
                Shuffle again
              </button>
              <Link to={deckPath} className="btn">
                Back to deck
              </Link>
            </div>
          </div>
        )}
      </main>

      {card && !finished && (
        <footer className="bottombar bottombar-split">
          <button className="btn" onClick={() => go(-1)} disabled={index === 0}>
            ‹ Prev
          </button>
          <button className="btn btn-primary" onClick={() => go(1)}>
            {index === cards.length - 1 ? 'Finish' : 'Next ›'}
          </button>
        </footer>
      )}
    </div>
  );
}
