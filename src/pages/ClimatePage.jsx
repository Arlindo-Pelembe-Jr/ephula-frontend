import { useEffect, useState } from "react";
import { getFarmers, getPlantingWindow } from "../api/client.js";
import ErrorMessage from "../components/ErrorMessage.jsx";
import LoadingSpinner from "../components/LoadingSpinner.jsx";
import StatCard from "../components/StatCard.jsx";

export default function ClimatePage() {
  const [farmers, setFarmers] = useState(null);
  const [error, setError] = useState(null);
  const [selectedMachambaId, setSelectedMachambaId] = useState("");
  const [climate, setClimate] = useState(null);
  const [climateLoading, setClimateLoading] = useState(false);
  const [climateError, setClimateError] = useState(null);

  useEffect(() => {
    getFarmers()
      .then(setFarmers)
      .catch(() => setError("Não foi possível carregar a lista de agricultores."));
  }, []);

  useEffect(() => {
    if (!selectedMachambaId) {
      setClimate(null);
      return;
    }
    setClimateLoading(true);
    setClimateError(null);
    getPlantingWindow(selectedMachambaId)
      .then(setClimate)
      .catch(() => setClimateError("Não foi possível obter dados climáticos para esta machamba."))
      .finally(() => setClimateLoading(false));
  }, [selectedMachambaId]);

  if (error) return <ErrorMessage message={error} />;
  if (farmers === null) return <LoadingSpinner />;

  const eligibleFarmers = farmers.filter((f) => f.machamba_id);

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-bold">Estado Climático · Região Piloto</h1>
        <p className="text-base-content/60">
          Baseado em dados NASA POWER + Open-Meteo
        </p>
      </div>

      <div className="form-control max-w-md">
        <label className="label">
          <span className="label-text">Seleccionar machamba:</span>
        </label>
        <select
          className="select select-bordered"
          value={selectedMachambaId}
          onChange={(e) => setSelectedMachambaId(e.target.value)}
        >
          <option value="">— Escolha um agricultor —</option>
          {eligibleFarmers.map((farmer) => (
            <option key={farmer.machamba_id} value={farmer.machamba_id}>
              {farmer.name} — {farmer.machamba_area_ha ?? "?"} ha de{" "}
              {farmer.machamba_crop ?? "cultura desconhecida"}
            </option>
          ))}
        </select>
      </div>

      {climateLoading && <LoadingSpinner label="A obter dados climáticos..." />}
      {climateError && <ErrorMessage message={climateError} />}

      {climate && !climateLoading && !climateError && (
        <div className="flex flex-col gap-6">
          <div
            className={`rounded-box p-8 text-center ${
              climate.window_open ? "bg-success text-success-content" : "bg-base-300"
            }`}
          >
            <p className="text-3xl font-bold">
              {climate.window_open ? "JANELA ABERTA" : "JANELA FECHADA"}
            </p>
            <p className="mt-2">{climate.notes}</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <StatCard
              value={`${climate.accumulated_precip_5d_mm} mm`}
              label="Precipitação acumulada (5 dias)"
            />
            <StatCard
              value={`${climate.threshold_mm} mm`}
              label="Threshold necessário"
            />
            <StatCard
              value={`${climate.forecast_rain_probability_pct}%`}
              label="Probabilidade previsão (7 dias)"
            />
          </div>

          <p>
            {climate.window_open
              ? "Com base nos dados actuais, recomendamos sementeira nos próximos 3-5 dias."
              : "A janela de sementeira ainda não está aberta para esta localização."}
          </p>

          <p className="italic text-sm text-base-content/50">
            Os thresholds actuais são baseados em valores da literatura
            agronómica. Validação com o IIAM está pendente.
          </p>
        </div>
      )}
    </div>
  );
}
