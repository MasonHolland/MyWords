import { useEffect, useRef, useState, type FormEvent } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ConfirmSheet } from '../components/ConfirmSheet';
import { TopBar } from '../components/TopBar';
import { addCard, db, deleteCard, updateCard, type FrontType } from '../db';
import { useObjectUrl } from '../hooks/useObjectUrl';
import { resizeImage } from '../lib/image';

export function CardEditor() {
  const { deckId = '', cardId } = useParams();
  const isNew = !cardId;
  const navigate = useNavigate();
  const deckPath = `/deck/${deckId}`;

  const [frontType, setFrontType] = useState<FrontType>('text');
  const [frontText, setFrontText] = useState('');
  const [frontImage, setFrontImage] = useState<Blob>();
  const [back, setBack] = useState('');
  const [loading, setLoading] = useState(!isNew);
  const [busy, setBusy] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [savedFlash, setSavedFlash] = useState(false);

  const fileInput = useRef<HTMLInputElement>(null);
  const frontTextRef = useRef<HTMLTextAreaElement>(null);
  const imageUrl = useObjectUrl(frontImage);

  useEffect(() => {
    if (isNew) return;
    let cancelled = false;
    db.cards.get(cardId).then((card) => {
      if (cancelled) return;
      if (!card) {
        navigate(deckPath, { replace: true });
        return;
      }
      setFrontType(card.frontType);
      setFrontText(card.frontText ?? '');
      setFrontImage(card.frontImage);
      setBack(card.back);
      setLoading(false);
    });
    return () => {
      cancelled = true;
    };
  }, [cardId, isNew, deckPath, navigate]);

  const frontValid = frontType === 'text' ? frontText.trim().length > 0 : !!frontImage;
  const valid = frontValid && back.trim().length > 0;

  const handleFile = async (file: File | undefined) => {
    if (!file) return;
    setBusy(true);
    try {
      setFrontImage(await resizeImage(file));
    } finally {
      setBusy(false);
    }
  };

  const save = async (addAnother: boolean) => {
    if (!valid || busy) return;
    setBusy(true);
    const input = { frontType, frontText: frontText.trim(), frontImage, back: back.trim() };
    try {
      if (isNew) await addCard(deckId, input);
      else await updateCard(cardId, input);
    } finally {
      setBusy(false);
    }
    if (addAnother) {
      setFrontText('');
      setFrontImage(undefined);
      setBack('');
      setSavedFlash(true);
      setTimeout(() => setSavedFlash(false), 1200);
      frontTextRef.current?.focus();
    } else {
      navigate(deckPath);
    }
  };

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    void save(false);
  };

  return (
    <div className="page">
      <TopBar title={isNew ? 'New card' : 'Edit card'} backTo={deckPath} backLabel="Deck" />

      {!loading && (
        <form className="content editor" onSubmit={handleSubmit}>
          <section className="field">
            <div className="field-head">
              <span className="label">Front</span>
              <div className="segmented" role="radiogroup" aria-label="Front type">
                {(['text', 'image'] as const).map((t) => (
                  <button
                    key={t}
                    type="button"
                    role="radio"
                    aria-checked={frontType === t}
                    className={frontType === t ? 'is-active' : ''}
                    onClick={() => setFrontType(t)}
                  >
                    {t === 'text' ? 'Text' : 'Image'}
                  </button>
                ))}
              </div>
            </div>

            {frontType === 'text' ? (
              <textarea
                ref={frontTextRef}
                className="input textarea"
                value={frontText}
                onChange={(e) => setFrontText(e.target.value)}
                placeholder="Word, question, or prompt"
                rows={3}
              />
            ) : (
              <div className="image-picker">
                {imageUrl ? (
                  <img src={imageUrl} alt="Front preview" className="image-preview" />
                ) : (
                  <div className="image-placeholder muted">No image selected</div>
                )}
                <input
                  ref={fileInput}
                  type="file"
                  accept="image/*"
                  hidden
                  onChange={(e) => {
                    void handleFile(e.target.files?.[0]);
                    e.target.value = '';
                  }}
                />
                <button type="button" className="btn" onClick={() => fileInput.current?.click()} disabled={busy}>
                  {imageUrl ? 'Change image' : 'Choose photo or take one'}
                </button>
              </div>
            )}
          </section>

          <section className="field">
            <label className="label" htmlFor="back">
              Back
            </label>
            <textarea
              id="back"
              className="input textarea"
              value={back}
              onChange={(e) => setBack(e.target.value)}
              placeholder="Answer or definition"
              rows={4}
            />
          </section>

          <div className="stack">
            <button type="submit" className="btn btn-primary" disabled={!valid || busy}>
              Save
            </button>
            {isNew && (
              <button type="button" className="btn" disabled={!valid || busy} onClick={() => void save(true)}>
                {savedFlash ? 'Saved ✓' : 'Save & add another'}
              </button>
            )}
            {!isNew && (
              <button type="button" className="btn btn-danger-outline" onClick={() => setConfirmDelete(true)}>
                Delete card
              </button>
            )}
          </div>
        </form>
      )}

      <ConfirmSheet
        open={confirmDelete}
        title="Delete this card?"
        confirmLabel="Delete card"
        onClose={() => setConfirmDelete(false)}
        onConfirm={async () => {
          if (cardId) await deleteCard(cardId);
          navigate(deckPath, { replace: true });
        }}
      />
    </div>
  );
}
