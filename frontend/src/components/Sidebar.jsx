// src/components/Sidebar.jsx
import React, { useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import {
  FaHome,
  FaBookOpen,
  FaPuzzlePiece,
  FaClipboardCheck,
  FaComments,
  FaChartBar,
  FaSignOutAlt,
} from "react-icons/fa";
import { jwtDecode } from "jwt-decode";

/**
 * Props opcionais:
 *   • isStaff = true  → força modo professor
 *   • isAluno = true  → força modo aluno
 */
export default function Sidebar({ isStaff = undefined, isAluno = undefined }) {
  const location = useLocation();
  const navigate = useNavigate();

  /* ───────── define (uma só vez) se é professor ───────── */
  const defaultIsStaff = useMemo(() => {
    if (isStaff === true) return true;
    if (isAluno === true) return false;

    try {
      const tok = localStorage.getItem("access");
      if (!tok) return false;
      return jwtDecode(tok).is_staff;
    } catch {
      return false;
    }
  }, [isStaff, isAluno]);

  const [staff, setStaff] = useState(defaultIsStaff);
  useEffect(() => setStaff(defaultIsStaff), [defaultIsStaff]);

  /* ───────── menus ───────── */
  const alunoMenu = [
    { path: "/home",         label: "Início",        icon: <FaHome /> },
    { path: "/aulas",        label: "Aulas",         icon: <FaBookOpen /> },
    { path: "/quizzes",      label: "Quizzes",       icon: <FaPuzzlePiece /> },
    { path: "/avaliacoes",   label: "Avaliação",     icon: <FaClipboardCheck /> },
    { path: "/forum",        label: "Fórum",         icon: <FaComments /> },
    { path: "/desempenho",   label: "Desempenho",    icon: <FaChartBar /> },
  ];

  const profMenu = [
    { path: "/professor",    label: "Início",        icon: <FaHome /> },
    { path: "/aulas-prof",   label: "Aulas",         icon: <FaBookOpen /> },  // ← corrigido
    { path: "/quizzes",      label: "Quizzes",       icon: <FaPuzzlePiece /> },
    { path: "/atividades",   label: "Atividades",    icon: <FaClipboardCheck /> },
    { path: "/forum",        label: "Fórum",         icon: <FaComments /> },
    { path: "/desempenho",   label: "Desempenho",    icon: <FaChartBar /> },
  ];

  const items     = staff ? profMenu : alunoMenu;
  const sidebarBg = staff ? "bg-blue-200" : "bg-gray-200";
  const hoverBg   = staff ? "hover:bg-blue-300" : "hover:bg-gray-300";

  /* ───────── render ───────── */
  return (
    <div className={`fixed top-0 left-0 flex h-screen w-64 flex-col ${sidebarBg}`}>
      {/* logo */}
      <div className="border-b border-gray-300 p-6 text-2xl font-bold">
        Plataforma<span className="text-green-500">AVA</span>
      </div>

      {/* links */}
      <nav className="flex-1 space-y-4 overflow-y-auto p-4">
        {items.map(({ path, label, icon }) => (
          <button
            key={path}
            onClick={() => navigate(path)}
            className={`flex w-full items-center gap-2 rounded px-4 py-2 text-left ${hoverBg} ${
              location.pathname === path ? "font-semibold text-green-700" : "text-black"
            }`}
          >
            {icon}
            {label}
          </button>
        ))}
      </nav>

      {/* sair */}
      <div className="border-t border-gray-300 p-4">
        <button
          onClick={() => {
            localStorage.clear();
            navigate("/");
          }}
          className="flex w-full items-center justify-center gap-2 rounded bg-red-500 py-2 text-white hover:bg-red-600"
        >
          <FaSignOutAlt /> Sair
        </button>
      </div>
    </div>
  );
}
