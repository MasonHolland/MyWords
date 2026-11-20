import { useEffect, useState, type FormEvent } from 'react';
import { Sheet } from './Sheet';

interface Props {
  open: boolean;
  title: string;
  initialValue?: string;
  submitLabel: string;
  onSubmit: (name: string) => void;
  onClose: () => void;
}

export function NameSheet({ open, title, initialValue = '', submitLabel, onSubmit, onClose }: Props) {
  const [value, setValue] = useState(initialValue);

  useEffect(() => {
    if (open) setValue(initialValue);
  }, [open, initialValue]);

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!value.trim()) return;
    onSubmit(value.trim());
  };

  return (
    <Sheet open={open} onClose={onClose} title={title}>
      <form onSubmit={handleSubmit} className="stack">
        <input
          className="input"
          autoFocus
          value={value}
          onChange={(e) => setValue(e.target.value)}
          placeholder="Deck name"
          maxLength={80}
          enterKeyHint="done"
        />
        <button type="submit" className="btn btn-primary" disabled={!value.trim()}>
          {submitLabel}
        </button>
        <button type="button" className="btn" onClick={onClose}>
          Cancel
        </button>
      </form>
    </Sheet>
  );
}
