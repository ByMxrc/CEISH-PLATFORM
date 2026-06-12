import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { EvaluationPage } from '../../features/evaluation/EvaluationPage';

export function AppRouter() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Navigate to="/evaluacion" replace />} />
        <Route path="/evaluacion" element={<EvaluationPage />} />
        <Route path="/evaluacion/:id" element={<EvaluationPage />} />
      </Routes>
    </BrowserRouter>
  );
}
