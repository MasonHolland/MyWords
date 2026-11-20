import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import { CardEditor } from './pages/CardEditor';
import { DeckDetail } from './pages/DeckDetail';
import { DeckList } from './pages/DeckList';
import { Study } from './pages/Study';

export function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<DeckList />} />
        <Route path="/deck/:deckId" element={<DeckDetail />} />
        <Route path="/deck/:deckId/card/new" element={<CardEditor key="new" />} />
        <Route path="/deck/:deckId/card/:cardId" element={<CardEditor />} />
        <Route path="/deck/:deckId/study" element={<Study />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
