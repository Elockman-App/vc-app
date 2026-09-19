import React from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { GameProvider } from "./context/GameContext";
import Play from "./pages/Play";
import AdminDashboard from "./pages/AdminDashboard";
import ScoreboardPage from "./pages/ScoreboardPage";
import ReportPage from "./pages/ReportPage";

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Navigate to="/play" replace />} />
        <Route
          path="/play"
          element={
            <GameProvider>
              <Play />
            </GameProvider>
          }
        />
        <Route path="/admin" element={<AdminDashboard />} />
        <Route path="/scoreboard" element={<ScoreboardPage />} />
        <Route path="/report" element={<ReportPage />} />
        <Route path="*" element={<Navigate to="/play" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
