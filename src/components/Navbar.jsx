import { NavLink, useNavigate } from "react-router-dom";

const LAST_PROGRAM_KEY = "ephula:lastProgramId";

export function rememberProgramId(programId) {
  localStorage.setItem(LAST_PROGRAM_KEY, programId);
}

export default function Navbar() {
  const navigate = useNavigate();

  function goToLastProgram() {
    const lastProgramId = localStorage.getItem(LAST_PROGRAM_KEY);
    navigate(lastProgramId ? `/programs/${lastProgramId}` : "/");
  }

  const linkClass = ({ isActive }) =>
    `btn btn-sm ${isActive ? "btn-primary" : "btn-ghost"}`;

  return (
    <div className="navbar bg-base-100 shadow-sm px-4">
      <div className="flex-1 flex items-center gap-3">
        <span className="text-2xl font-bold text-primary">Ephula</span>
        <span className="hidden sm:inline text-sm text-base-content/60">
          Sistema de Recomendação Agrícola
        </span>
      </div>
      <div className="flex-none flex gap-2">
        <NavLink to="/" className={linkClass} end>
          Dashboard
        </NavLink>
        <NavLink to="/register" className={linkClass}>
          Registar Agricultor
        </NavLink>
        <NavLink to="/clima" className={linkClass}>
          Clima
        </NavLink>
        <button className="btn btn-sm btn-ghost" onClick={goToLastProgram}>
          Ver Programa
        </button>
      </div>
    </div>
  );
}
