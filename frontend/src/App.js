// src/App.js
import React from "react";
import {
  BrowserRouter,
  Routes,
  Route,
} from "react-router-dom";

import Login          from "./pages/Login";
import Home           from "./pages/Home";
import Professor      from "./pages/Professor";
import Cadastro       from "./pages/Cadastro";
import AulasAluno     from "./pages/AulasAluno";
import AulasProfessor from "./pages/AulasProfessor";   // ← novo import

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* login / cadastro */}
        <Route path="/"          element={<Login     />} />
        <Route path="/cadastro"  element={<Cadastro  />} />

        {/* painel aluno */}
        <Route path="/home"      element={<Home      />} />
        <Route path="/aulas"     element={<AulasAluno />} />

        {/* painel professor */}
        <Route path="/professor"    element={<Professor      />} />
        <Route path="/aulas-prof"   element={<AulasProfessor />} />
      </Routes>
    </BrowserRouter>
  );
}
