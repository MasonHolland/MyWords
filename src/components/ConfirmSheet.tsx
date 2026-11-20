import { Sheet } from './Sheet';

interface Props {
  open: boolean;
  title: string;
  message?: string;
  confirmLabel: string;
  onConfirm: () => void;
  onClose: () => void;
}

export function ConfirmSheet({ open, title, message, confirmLabel, onConfirm, onClose }: Props) {
  return (
    <Sheet open={open} onClose={onClose} title={title}>
      <div className="stack">
        {message && <p className="muted">{message}</p>}
        <button className="btn btn-danger" onClick={onConfirm}>
          {confirmLabel}
        </button>
        <button className="btn" onClick={onClose}>
          Cancel
        </button>
      </div>
    </Sheet>
  );
}
