import { useCallback, useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import {
  getPlantingWindow,
  getProgram,
  getProgramMessages,
  processInboundSMS,
  triggerEngine,
} from "../api/client.js";
import ErrorMessage from "../components/ErrorMessage.jsx";
import LoadingSpinner from "../components/LoadingSpinner.jsx";
import { rememberProgramId } from "../components/Navbar.jsx";
import { useToast } from "../components/Toast.jsx";

const TIMELINE = [
  { phase: "PRE_SEASON", label: "Pré-época" },
  { phase: "PLANTING", label: "Sementeira" },
  { phase: "FERTILIZATION", label: "Adubação" },
  { phase: "ALERTS", label: "Alertas" },
  { phase: "HARVEST", label: "Colheita" },
  { phase: "FEEDBACK", label: "Feedback" },
  { phase: "COMPLETED", label: "Concluído" },
];

// Only the replies the backend actually understands for each phase
// (ProcessInboundSMSUseCase.execute) — showing an action outside its
// phase produced a blank bot reply, since the backend silently returns
// "" for a reply it can't route.
const PHASE_ACTIONS = {
  PRE_SEASON: ["SEMEEI"],
  PLANTING: ["SEMEEI"],
  FERTILIZATION: ["ADUBEI"],
  ALERTS: [],
  HARVEST: ["15 sacos", "20 sacos"],
  FEEDBACK: ["15 sacos", "20 sacos"],
  COMPLETED: [],
};

export default function ProgramDetail() {
  const { programId } = useParams();
  const [program, setProgram] = useState(null);
  const [messages, setMessages] = useState([]);
  const [climate, setClimate] = useState(null);
  const [climateError, setClimateError] = useState(false);
  const [error, setError] = useState(null);
  const [chatLog, setChatLog] = useState([]);
  const [inputText, setInputText] = useState("");
  const [sending, setSending] = useState(false);
  const [evaluating, setEvaluating] = useState(false);
  const showToast = useToast();

  const loadProgram = useCallback(async () => {
    try {
      const data = await getProgram(programId);
      setProgram(data);
      rememberProgramId(programId);
      return data;
    } catch {
      setError("Não foi possível carregar o programa.");
      return null;
    }
  }, [programId]);

  const loadMessages = useCallback(async () => {
    try {
      const data = await getProgramMessages(programId);
      setMessages(data);
    } catch {
      // message history is secondary; keep the page usable without it
    }
  }, [programId]);

  const loadClimate = useCallback(async (machambaId) => {
    setClimateError(false);
    try {
      const data = await getPlantingWindow(machambaId);
      setClimate(data);
    } catch {
      setClimateError(true);
    }
  }, []);

  useEffect(() => {
    (async () => {
      const data = await loadProgram();
      await loadMessages();
      if (data && data.machamba_location_lat !== null && data.machamba_location_lon !== null) {
        await loadClimate(data.machamba_id);
      }
    })();
  }, [loadProgram, loadMessages, loadClimate]);

  async function handleSend(text) {
    if (!program || !text.trim()) return;
    setSending(true);
    try {
      const sentText = text;
      const { reply } = await processInboundSMS(program.farmer_phone, sentText);
      const replyText =
        reply ||
        "Ephula: mensagem recebida mas não reconhecida na fase actual — nada foi alterado.";
      setChatLog((prev) => [
        ...prev,
        { direction: "out", text: sentText },
        { direction: "in", text: replyText },
      ]);
      setInputText("");
      if (reply) {
        const wasCompleted = program.current_phase === "COMPLETED";
        const updated = await loadProgram();
        await loadMessages();
        if (updated && updated.current_phase === "COMPLETED" && !wasCompleted) {
          showToast(
            `Programa concluído! Colheita registada: ${updated.reported_yield_sacks ?? "—"} sacos.`,
            "success"
          );
        }
      }
    } catch {
      setChatLog((prev) => [
        ...prev,
        { direction: "out", text },
        { direction: "in", text: "Erro ao processar a mensagem." },
      ]);
    } finally {
      setSending(false);
    }
  }

  async function handleEvaluateNow() {
    setEvaluating(true);
    try {
      await triggerEngine();
      await loadProgram();
      await loadMessages();
      showToast(
        "Motor avaliado. A fase avança se as condições climáticas foram cumpridas.",
        "success"
      );
    } catch {
      showToast("Não foi possível avaliar o motor agora.", "error");
    } finally {
      setEvaluating(false);
    }
  }

  if (error) return <ErrorMessage message={error} onRetry={loadProgram} />;
  if (program === null) return <LoadingSpinner />;

  const currentIndex = TIMELINE.findIndex((step) => step.phase === program.current_phase);

  return (
    <div className="flex flex-col gap-6">
      <div className="card bg-base-100 shadow-sm">
        <div className="card-body">
          <h1 className="text-2xl font-bold">{program.farmer_name}</h1>
          <p className="text-base-content/60">{program.farmer_phone}</p>
          <p>
            Machamba: {program.machamba_area_ha} ha, {program.machamba_crop ?? "—"},{" "}
            {program.farmer_province ?? "—"}
          </p>
          <p className="text-xs font-mono text-base-content/40">{program.id}</p>
        </div>
      </div>

      <div className="overflow-x-auto">
        <ul className="steps steps-horizontal w-full min-w-[640px]">
          {TIMELINE.map((step, index) => (
            <li
              key={step.phase}
              data-content={
                index < currentIndex || (index === currentIndex && step.phase === "COMPLETED")
                  ? "✓"
                  : ""
              }
              className={`step ${index <= currentIndex ? "step-primary" : ""} ${
                index === currentIndex && step.phase !== "COMPLETED" ? "animate-pulse" : ""
              }`}
            >
              {step.label}
            </li>
          ))}
        </ul>
      </div>

      <div className="card bg-base-100 shadow-sm">
        <div className="card-body">
          <h2 className="card-title text-base">Painel Climático</h2>
          {program.machamba_location_lat === null || program.machamba_location_lon === null ? (
            <p className="text-base-content/60">
              Sem coordenadas GPS — dados climáticos não disponíveis para esta
              machamba
            </p>
          ) : climateError ? (
            <p className="text-base-content/60">
              Não foi possível obter dados climáticos.
            </p>
          ) : climate === null ? (
            <LoadingSpinner label="A obter dados climáticos..." />
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <p className="text-sm text-base-content/60">Janela de sementeira</p>
                <span className={`badge ${climate.window_open ? "badge-success" : "badge-ghost"}`}>
                  {climate.window_open ? "ABERTA" : "FECHADA"}
                </span>
              </div>
              <div>
                <p className="text-sm text-base-content/60">Precipitação 5 dias</p>
                <p className="font-semibold">
                  {climate.accumulated_precip_5d_mm} mm de {climate.threshold_mm} mm
                  necessários
                </p>
              </div>
              <div>
                <p className="text-sm text-base-content/60">Prob. chuva 7 dias</p>
                <p className="font-semibold">{climate.forecast_rain_probability_pct}%</p>
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="card bg-base-100 shadow-sm">
        <div className="card-body">
          <h2 className="card-title text-base">Simular resposta do agricultor</h2>
          <p className="text-sm text-base-content/60">
            Em produção, o agricultor envia esta mensagem via SMS para o número
            Ephula
          </p>
          <p className="text-xs text-base-content/50">
            As fases após a sementeira avançam quando o motor climático avalia
            as condições (2x/dia). Uma confirmação como "ADUBEI" fica
            registada mas só faz o programa avançar depois dessa avaliação —
            usa o botão abaixo para forçar uma avaliação imediata.{" "}
            <button
              className="link link-primary"
              disabled={evaluating}
              onClick={handleEvaluateNow}
            >
              {evaluating ? "A avaliar…" : "Avaliar agora →"}
            </button>
          </p>

          <div className="flex flex-wrap gap-2 mt-2">
            {[...(PHASE_ACTIONS[program.current_phase] ?? []), "PARAR"].map((action) => (
              <button
                key={action}
                className="btn btn-sm btn-outline rounded-full"
                disabled={sending}
                onClick={() => handleSend(action)}
              >
                {action}
              </button>
            ))}
          </div>

          <div className="flex gap-2 mt-3">
            <input
              type="text"
              className="input input-bordered flex-1"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") handleSend(inputText);
              }}
            />
            <button
              className="btn btn-primary"
              disabled={sending}
              onClick={() => handleSend(inputText)}
            >
              Enviar
            </button>
          </div>

          {chatLog.length > 0 && (
            <div className="flex flex-col gap-2 mt-4">
              {chatLog.map((entry, index) =>
                entry.direction === "out" ? (
                  <div key={index} className="chat chat-end">
                    <div className="chat-bubble chat-bubble-success">{entry.text}</div>
                  </div>
                ) : (
                  <div key={index} className="chat chat-start">
                    <div className="chat-image avatar placeholder">
                      <div className="bg-neutral text-neutral-content rounded-full w-8">
                        <span className="text-xs">EP</span>
                      </div>
                    </div>
                    <div className="chat-bubble">{entry.text}</div>
                  </div>
                )
              )}
            </div>
          )}
        </div>
      </div>

      <div className="card bg-base-100 shadow-sm">
        <div className="card-body">
          <h2 className="card-title text-base">Histórico de Mensagens</h2>
          {messages.length === 0 ? (
            <p className="text-base-content/60">
              Ainda não foram trocadas mensagens neste programa.
            </p>
          ) : (
            <div className="flex flex-col gap-3">
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={`chat ${message.direction === "out" ? "chat-end" : "chat-start"}`}
                >
                  <div className="chat-header">
                    {message.direction === "out" ? "Ephula" : "Agricultor"}
                  </div>
                  <div
                    className={`chat-bubble ${
                      message.direction === "out" ? "chat-bubble-success" : ""
                    }`}
                  >
                    {message.content}
                  </div>
                  <div className="chat-footer text-xs text-base-content/50">
                    {message.phase} ·{" "}
                    {message.sent_at
                      ? new Date(message.sent_at).toLocaleString("pt-PT")
                      : "—"}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
