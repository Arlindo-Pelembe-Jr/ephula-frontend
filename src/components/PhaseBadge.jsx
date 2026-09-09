const PHASE_MAP = {
  PRE_SEASON: { className: "badge-ghost", label: "Pré-época" },
  PLANTING: { className: "badge-success", label: "Sementeira" },
  FERTILIZATION: { className: "badge-warning", label: "Adubação" },
  ALERTS: { className: "badge-error", label: "Alerta" },
  HARVEST: { className: "badge-info", label: "Colheita" },
  FEEDBACK: { className: "badge-primary", label: "Feedback" },
  COMPLETED: { className: "badge-neutral", label: "Concluído" },
};

export default function PhaseBadge({ phase }) {
  const entry = PHASE_MAP[phase] ?? { className: "badge-ghost", label: "—" };
  return <span className={`badge ${entry.className}`}>{entry.label}</span>;
}

export { PHASE_MAP };
