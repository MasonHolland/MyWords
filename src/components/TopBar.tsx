import type { ReactNode } from 'react';
import { Link } from 'react-router-dom';

interface Props {
  title: string;
  backTo?: string;
  backLabel?: string;
  right?: ReactNode;
}

export function TopBar({ title, backTo, backLabel = 'Back', right }: Props) {
  return (
    <header className="topbar">
      <div className="topbar-side">
        {backTo && (
          <Link to={backTo} className="topbar-back" aria-label={backLabel}>
            <span aria-hidden>‹</span> {backLabel}
          </Link>
        )}
      </div>
      <h1 className="topbar-title">{title}</h1>
      <div className="topbar-side topbar-right">{right}</div>
    </header>
  );
}
