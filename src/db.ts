import Dexie, { type EntityTable } from 'dexie';
import { withSequentialOrder } from './lib/reorder';

export interface Deck {
  id: string;
  name: string;
  createdAt: number;
  updatedAt: number;
}

export type FrontType = 'text' | 'image';

export interface Card {
  id: string;
  deckId: string;
  order: number;
  frontType: FrontType;
  frontText?: string;
  frontImage?: Blob;
  back: string;
  createdAt: number;
}

export const db = new Dexie('mywords') as Dexie & {
  decks: EntityTable<Deck, 'id'>;
  cards: EntityTable<Card, 'id'>;
};

db.version(1).stores({
  decks: 'id, updatedAt',
  cards: 'id, deckId, [deckId+order]',
});

const newId = () => crypto.randomUUID();

const deckRange = (deckId: string) =>
  db.cards.where('[deckId+order]').between([deckId, Dexie.minKey], [deckId, Dexie.maxKey]);

export async function createDeck(name: string): Promise<string> {
  const now = Date.now();
  const id = newId();
  await db.decks.add({ id, name: name.trim(), createdAt: now, updatedAt: now });
  return id;
}

export async function renameDeck(id: string, name: string): Promise<void> {
  await db.decks.update(id, { name: name.trim(), updatedAt: Date.now() });
}

export async function deleteDeck(id: string): Promise<void> {
  await db.transaction('rw', db.decks, db.cards, async () => {
    await db.cards.where('deckId').equals(id).delete();
    await db.decks.delete(id);
  });
}

/** Cards of a deck, sorted by their saved order. */
export function getDeckCards(deckId: string): Promise<Card[]> {
  return deckRange(deckId).toArray();
}

export type CardInput = Pick<Card, 'frontType' | 'frontText' | 'frontImage' | 'back'>;

/** Keeps only the fields that belong to the chosen front type. */
function normalize(input: CardInput): CardInput {
  return input.frontType === 'text'
    ? { frontType: 'text', frontText: input.frontText ?? '', frontImage: undefined, back: input.back }
    : { frontType: 'image', frontImage: input.frontImage, frontText: undefined, back: input.back };
}

export async function addCard(deckId: string, input: CardInput): Promise<string> {
  const id = newId();
  await db.transaction('rw', db.decks, db.cards, async () => {
    const last = await deckRange(deckId).last();
    await db.cards.add({
      id,
      deckId,
      order: last ? last.order + 1 : 0,
      createdAt: Date.now(),
      ...normalize(input),
    });
    await db.decks.update(deckId, { updatedAt: Date.now() });
  });
  return id;
}

export async function updateCard(id: string, input: CardInput): Promise<void> {
  await db.cards.update(id, normalize(input));
}

export async function deleteCard(id: string): Promise<void> {
  await db.transaction('rw', db.cards, async () => {
    const card = await db.cards.get(id);
    if (!card) return;
    await db.cards.delete(id);
    await saveCardOrder(await getDeckCards(card.deckId));
  });
}

/** Persists the given cards' positions as their order (0..n-1). */
export async function saveCardOrder(cards: readonly Card[]): Promise<void> {
  const ordered = withSequentialOrder(cards);
  await db.transaction('rw', db.cards, async () => {
    await Promise.all(ordered.map((c) => db.cards.update(c.id, { order: c.order })));
  });
}
