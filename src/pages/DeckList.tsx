import { useLiveQuery } from 'dexie-react-hooks';
import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ConfirmSheet } from '../components/ConfirmSheet';
import { NameSheet } from '../components/NameSheet';
import { Sheet } from '../components/Sheet';
import { TopBar } from '../components/TopBar';
import { createDeck, db, deleteDeck, renameDeck, type Deck } from '../db';

type Mode = { kind: 'none' } | { kind: 'create' } | { kind: 'menu' | 'rename' | 'delete'; deck: Deck };

export function DeckList() {
  const navigate = useNavigate();
  const [mode, setMode] = useState<Mode>({ kind: 'none' });
  const close = () => setMode({ kind: 'none' });

  const decks = useLiveQuery(async () => {
    const all = await db.decks.orderBy('updatedAt').reverse().toArray();
    const counts = await Promise.all(all.map((d) => db.cards.where('deckId').equals(d.id).count()));
    return all.map((deck, i) => ({ deck, count: counts[i] }));
  });

  const selected = mode.kind !== 'none' && mode.kind !== 'create' ? mode.deck : undefined;

  return (
    <div className="page">
      <TopBar title="My Decks" />

      <main className="content">
        {decks && decks.length === 0 && (
          <div className="empty">
            <div className="empty-art" aria-hidden>🗂️</div>
            <p>No decks yet.</p>
            <p className="muted">Create a deck, then add some cards to study.</p>
          </div>
        )}
        <ul className="deck-list">
          {decks?.map(({ deck, count }) => (
            <li key={deck.id} className="deck-row">
              <Link to={`/deck/${deck.id}`} className="deck-row-link">
                <span className="deck-name">{deck.name}</span>
                <span className="muted">
                  {count} {count === 1 ? 'card' : 'cards'}
                </span>
              </Link>
              <button
                type="button"
                className="icon-btn"
                aria-label={`Options for ${deck.name}`}
                onClick={() => setMode({ kind: 'menu', deck })}
              >
                ⋯
              </button>
            </li>
          ))}
        </ul>
      </main>

      <footer className="bottombar">
        <button className="btn btn-primary btn-block" onClick={() => setMode({ kind: 'create' })}>
          + New deck
        </button>
      </footer>

      <NameSheet
        open={mode.kind === 'create'}
        title="New deck"
        submitLabel="Create"
        onClose={close}
        onSubmit={async (name) => {
          const id = await createDeck(name);
          close();
          navigate(`/deck/${id}`);
        }}
      />

      <Sheet open={mode.kind === 'menu'} onClose={close} title={selected?.name}>
        <div className="stack">
          <button className="btn" onClick={() => selected && setMode({ kind: 'rename', deck: selected })}>
            Rename
          </button>
          <button
            className="btn btn-danger-outline"
            onClick={() => selected && setMode({ kind: 'delete', deck: selected })}
          >
            Delete
          </button>
          <button className="btn" onClick={close}>
            Cancel
          </button>
        </div>
      </Sheet>

      <NameSheet
        open={mode.kind === 'rename'}
        title="Rename deck"
        initialValue={selected?.name}
        submitLabel="Save"
        onClose={close}
        onSubmit={async (name) => {
          if (selected) await renameDeck(selected.id, name);
          close();
        }}
      />

      <ConfirmSheet
        open={mode.kind === 'delete'}
        title={`Delete "${selected?.name ?? ''}"?`}
        message="This deletes the deck and all of its cards. This can't be undone."
        confirmLabel="Delete deck"
        onClose={close}
        onConfirm={async () => {
          if (selected) await deleteDeck(selected.id);
          close();
        }}
      />
    </div>
  );
}
