import { ChevronRight, ClipboardCheck, Sprout, Users, Zap } from "lucide-react";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getFarmers, triggerEngine } from "../api/client.js";
import ErrorMessage from "../components/ErrorMessage.jsx";
import LoadingSpinner from "../components/LoadingSpinner.jsx";
import PhaseBadge, { PHASE_MAP } from "../components/PhaseBadge.jsx";
import StatCard from "../components/StatCard.jsx";
import { useToast } from "../components/Toast.jsx";

const PHASE_BAR_COLOR = {
  PRE_SEASON: "bg-base-300",
  PLANTING: "bg-success",
  FERTILIZATION: "bg-warning",
  ALERTS: "bg-error",
  HARVEST: "bg-info",
  FEEDBACK: "bg-primary",
  COMPLETED: "bg-neutral",
};

const PAGE_SIZE = 10;

export default function Dashboard() {
  const [farmers, setFarmers] = useState(null);
  const [error, setError] = useState(null);
  const [triggering, setTriggering] = useState(false);
  const [listOpen, setListOpen] = useState(false);
  const [page, setPage] = useState(0);
  const navigate = useNavigate();
  const showToast = useToast();

  async function loadFarmers() {
    setError(null);
    try {
      const data = await getFarmers();
      setFarmers(data);
    } catch {
      setError("Não foi possível carregar os agricultores.");
    }
  }

  useEffect(() => {
    loadFarmers();
  }, []);

  async function handleTriggerEngine() {
    setTriggering(true);
    try {
      await triggerEngine();
      showToast(
        "Motor activado. Os programas serão avaliados nos próximos segundos.",
        "success"
      );
    } catch {
      showToast("Não foi possível activar o motor de avaliação.", "error");
    } finally {
      setTriggering(false);
    }
  }

  if (error) return <ErrorMessage message={error} onRetry={loadFarmers} />;
  if (farmers === null) return <LoadingSpinner />;

  const registered = farmers.length;
  const activePrograms = farmers.filter(
    (f) => f.active_program_phase && f.active_program_phase !== "COMPLETED"
  ).length;
  const readyToPlant = farmers.filter(
    (f) => f.active_program_phase === "PLANTING"
  ).length;
  const feedbacksReceived = farmers.filter(
    (f) => f.reported_yield_sacks !== null && f.reported_yield_sacks !== undefined
  ).length;

  const statCards = (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      <StatCard icon={Users} value={registered} label="Agricultores Registados" />
      <StatCard icon={Zap} value={activePrograms} label="Programas Activos" />
      <StatCard icon={Sprout} value={readyToPlant} label="Prontos para Semear" />
      <StatCard
        icon={ClipboardCheck}
        value={feedbacksReceived}
        label="Feedbacks Recebidos"
      />
    </div>
  );

  if (registered === 0) {
    return (
      <div className="flex flex-col gap-6">
        {statCards}
        <div className="flex flex-col items-center justify-center gap-4 py-20 text-center">
          <div className="w-24 h-24 rounded-full bg-primary/10 flex items-center justify-center">
            <Sprout size={48} className="text-primary" />
          </div>
          <p className="text-base-content/60 max-w-sm">
            Nenhum agricultor registado ainda. Clique em Registar Agricultor
            para começar.
          </p>
        </div>
      </div>
    );
  }

  const phaseCounts = Object.keys(PHASE_MAP).reduce((acc, phase) => {
    acc[phase] = farmers.filter((f) => f.active_program_phase === phase).length;
    return acc;
  }, {});
  const maxPhaseCount = Math.max(1, ...Object.values(phaseCounts));

  const totalPages = Math.max(1, Math.ceil(registered / PAGE_SIZE));
  const currentPage = Math.min(page, totalPages - 1);
  const pageFarmers = farmers.slice(
    currentPage * PAGE_SIZE,
    currentPage * PAGE_SIZE + PAGE_SIZE
  );

  return (
    <div className="flex flex-col gap-6">
      {statCards}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2 card bg-base-100 shadow-sm">
          <div className="card-body">
            <div className="flex items-center justify-between gap-3">
              <h2 className="card-title text-base">Programas por Fase</h2>
              <button
                className="btn btn-secondary btn-sm"
                onClick={handleTriggerEngine}
                disabled={triggering}
              >
                {triggering ? (
                  <span className="loading loading-spinner loading-xs" />
                ) : (
                  "▶ Avaliar Agora"
                )}
              </button>
            </div>
            <div className="flex flex-col gap-2 mt-2">
              {Object.entries(PHASE_MAP).map(([phase, { label }]) => (
                <div key={phase} className="flex items-center gap-3">
                  <span className="w-24 text-sm text-base-content/70 shrink-0">
                    {label}
                  </span>
                  <div className="flex-1 bg-base-200 rounded-full h-3 overflow-hidden">
                    <div
                      className={`h-full rounded-full ${PHASE_BAR_COLOR[phase]}`}
                      style={{
                        width: `${(phaseCounts[phase] / maxPhaseCount) * 100}%`,
                      }}
                    />
                  </div>
                  <span className="w-6 text-right text-sm font-semibold tabular-nums">
                    {phaseCounts[phase]}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="card bg-base-100 shadow-sm">
          <div className="card-body justify-center">
            <h2 className="card-title text-base">Agricultores</h2>
            <p className="text-base-content/60 text-sm">
              {registered} agricultor{registered === 1 ? "" : "es"} registados
              no total.
            </p>
            <button
              className="btn btn-outline btn-sm mt-2"
              onClick={() => setListOpen((v) => !v)}
            >
              {listOpen ? "Ocultar lista" : "Ver lista de agricultores →"}
            </button>
          </div>
        </div>
      </div>

      {listOpen && (
        <div className="flex flex-col gap-3">
          <div className="overflow-x-auto bg-base-100 rounded-box shadow-sm">
            <table className="table table-zebra">
              <thead>
                <tr>
                  <th>Nome</th>
                  <th>Telefone</th>
                  <th>Canal</th>
                  <th>Fase Actual</th>
                  <th>Machamba</th>
                  <th>Registado em</th>
                  <th />
                </tr>
              </thead>
              <tbody>
                {pageFarmers.map((farmer) => (
                  <tr
                    key={farmer.id}
                    className={farmer.active_program_id ? "hover cursor-pointer" : ""}
                    onClick={() => {
                      if (farmer.active_program_id) {
                        navigate(`/programs/${farmer.active_program_id}`);
                      }
                    }}
                  >
                    <td>{farmer.name}</td>
                    <td>{farmer.phone}</td>
                    <td className="uppercase text-xs">{farmer.channel}</td>
                    <td>
                      <PhaseBadge phase={farmer.active_program_phase} />
                    </td>
                    <td>
                      {farmer.machamba_area_ha
                        ? `${farmer.machamba_area_ha} ha · ${farmer.machamba_crop ?? "—"}`
                        : "—"}
                    </td>
                    <td className="text-sm text-base-content/60">
                      {new Date(farmer.created_at).toLocaleDateString("pt-PT")}
                    </td>
                    <td className="w-6">
                      {farmer.active_program_id && (
                        <ChevronRight size={16} className="text-base-content/40" />
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {totalPages > 1 && (
            <div className="flex items-center justify-between text-sm text-base-content/60">
              <span>
                {currentPage * PAGE_SIZE + 1}–
                {Math.min(registered, (currentPage + 1) * PAGE_SIZE)} de {registered}
              </span>
              <div className="join">
                <button
                  className="join-item btn btn-sm"
                  disabled={currentPage === 0}
                  onClick={() => setPage((p) => p - 1)}
                >
                  «
                </button>
                <button className="join-item btn btn-sm btn-disabled">
                  {currentPage + 1} / {totalPages}
                </button>
                <button
                  className="join-item btn btn-sm"
                  disabled={currentPage >= totalPages - 1}
                  onClick={() => setPage((p) => p + 1)}
                >
                  »
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
