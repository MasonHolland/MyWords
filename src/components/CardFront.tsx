import type { Card } from '../db';
import { useObjectUrl } from '../hooks/useObjectUrl';

interface Props {
  card: Pick<Card, 'frontType' | 'frontText' | 'frontImage'>;
  /** "thumb" for list rows, "full" for the study card. */
  variant: 'thumb' | 'full';
}

export function CardFront({ card, variant }: Props) {
  const url = useObjectUrl(card.frontType === 'image' ? card.frontImage : undefined);

  if (card.frontType === 'image') {
    return url ? (
      <img src={url} alt="Card front" className={`front-img front-img-${variant}`} draggable={false} />
    ) : (
      <span className="muted">No image</span>
    );
  }
  return <span className={`front-text front-text-${variant}`}>{card.frontText}</span>;
}
