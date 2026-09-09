import { useState } from "react";
import { Link } from "react-router-dom";
import { registerFarmer } from "../api/client.js";
import { rememberProgramId } from "../components/Navbar.jsx";

const PROVINCES = [
  "Cabo Delgado",
  "Niassa",
  "Nampula",
  "Zambézia",
  "Tete",
  "Manica",
  "Sofala",
  "Inhambane",
  "Gaza",
  "Maputo Província",
  "Maputo Cidade",
];

const CROPS = [
  "Milho",
  "Amendoim",
  "Feijão Vulgar",
  "Feijão Nhemba",
  "Soja",
  "Outra",
];

const INITIAL_FORM = {
  name: "",
  sex: "M",
  age: "",
  phone: "",
  province: PROVINCES[0],
  district: "",
  channel: "pwa",
  consent: false,
  area_ha: "",
  crop: CROPS[0],
  variety: "",
  has_fertilizer: false,
  has_irrigation: false,
  location_lat: "",
  location_lon: "",
};

export default function RegisterFarmer() {
  const [form, setForm] = useState(INITIAL_FORM);
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [apiError, setApiError] = useState(null);
  const [result, setResult] = useState(null);

  function update(field, value) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  function validate() {
    const next = {};
    if (!form.name.trim()) next.name = "Nome completo é obrigatório.";
    if (!form.age || form.age < 14 || form.age > 100) {
      next.age = "Idade deve estar entre 14 e 100.";
    }
    if (!/^258\d{9}$/.test(form.phone)) {
      next.phone = "Formato: 258 seguido de 9 dígitos.";
    }
    if (!form.province) next.province = "Província é obrigatória.";
    if (!form.channel) next.channel = "Canal é obrigatório.";
    if (!form.consent) next.consent = "É necessário dar consentimento.";
    if (!form.area_ha || form.area_ha < 0.1 || form.area_ha > 50) {
      next.area_ha = "Área deve estar entre 0.1 e 50 ha.";
    }
    if (!form.crop) next.crop = "Cultura é obrigatória.";
    setErrors(next);
    return Object.keys(next).length === 0;
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setApiError(null);
    if (!validate()) return;

    setSubmitting(true);
    try {
      const payload = {
        name: form.name.trim(),
        sex: form.sex,
        age: Number(form.age),
        phone: `+${form.phone}`,
        province: form.province,
        district: form.district.trim() || null,
        channel: form.channel,
        consent: form.consent,
        consent_channel: "pwa",
        machamba: {
          area_ha: Number(form.area_ha),
          location_lat: form.location_lat === "" ? null : Number(form.location_lat),
          location_lon: form.location_lon === "" ? null : Number(form.location_lon),
          crop: form.crop,
          variety: form.variety.trim() || null,
          has_fertilizer: form.has_fertilizer,
          has_irrigation: form.has_irrigation,
        },
      };
      const data = await registerFarmer(payload);
      rememberProgramId(data.program_id);
      setResult(data);
    } catch (err) {
      const detail = err?.response?.data?.detail;
      setApiError(
        typeof detail === "string"
          ? detail
          : "Não foi possível registar o agricultor. Verifique os dados e tente novamente."
      );
    } finally {
      setSubmitting(false);
    }
  }

  function handleRegisterAnother() {
    setResult(null);
    setForm(INITIAL_FORM);
    setErrors({});
    setApiError(null);
  }

  if (result) {
    return (
      <div className="max-w-xl mx-auto">
        <div className="alert alert-success flex-col items-start gap-2">
          <p className="font-bold">✓ Agricultor registado com sucesso</p>
          <p>
            Nome: {result.name} | ID: {result.id.slice(0, 8)}
          </p>
          <p>
            Programa criado: fase {result.program_phase} · Época{" "}
            {result.season_label}
          </p>
        </div>
        <div className="flex gap-3 mt-4">
          <Link to={`/programs/${result.program_id}`} className="btn btn-primary">
            Ver Programa →
          </Link>
          <button className="btn btn-outline" onClick={handleRegisterAnother}>
            Registar Outro
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto">
      <h1 className="text-2xl font-bold">Registar Agricultor</h1>
      <p className="text-base-content/60 mb-6">
        Canal web · Os mesmos dados são aceites via SMS, USSD ou este
        formulário
      </p>

      {apiError && <div className="alert alert-error mb-4">{apiError}</div>}

      <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-4">
        <div className="form-control">
          <label className="label">
            <span className="label-text">Nome completo*</span>
          </label>
          <input
            type="text"
            className={`input input-bordered ${errors.name ? "input-error" : ""}`}
            value={form.name}
            onChange={(e) => update("name", e.target.value)}
          />
          {errors.name && <span className="text-error text-xs mt-1">{errors.name}</span>}
        </div>

        <div className="form-control">
          <label className="label">
            <span className="label-text">Província*</span>
          </label>
          <select
            className="select select-bordered"
            value={form.province}
            onChange={(e) => update("province", e.target.value)}
          >
            {PROVINCES.map((p) => (
              <option key={p} value={p}>
                {p}
              </option>
            ))}
          </select>
        </div>

        <div className="form-control">
          <label className="label">
            <span className="label-text">Sexo*</span>
          </label>
          <div className="flex gap-4 pt-2">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="radio"
                name="sex"
                className="radio radio-primary"
                checked={form.sex === "M"}
                onChange={() => update("sex", "M")}
              />
              Masculino
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="radio"
                name="sex"
                className="radio radio-primary"
                checked={form.sex === "F"}
                onChange={() => update("sex", "F")}
              />
              Feminino
            </label>
          </div>
        </div>

        <div className="form-control">
          <label className="label">
            <span className="label-text">Distrito</span>
          </label>
          <input
            type="text"
            className="input input-bordered"
            value={form.district}
            onChange={(e) => update("district", e.target.value)}
          />
        </div>

        <div className="form-control">
          <label className="label">
            <span className="label-text">Idade*</span>
          </label>
          <input
            type="number"
            min={14}
            max={100}
            className={`input input-bordered ${errors.age ? "input-error" : ""}`}
            value={form.age}
            onChange={(e) => update("age", e.target.value)}
          />
          {errors.age && <span className="text-error text-xs mt-1">{errors.age}</span>}
        </div>

        <div className="form-control">
          <label className="label">
            <span className="label-text">Canal*</span>
          </label>
          <select
            className="select select-bordered"
            value={form.channel}
            onChange={(e) => update("channel", e.target.value)}
          >
            <option value="sms">SMS</option>
            <option value="ussd">USSD</option>
            <option value="pwa">PWA</option>
          </select>
        </div>

        <div className="form-control">
          <label className="label">
            <span className="label-text">Contacto telefónico*</span>
          </label>
          <input
            type="text"
            placeholder="258841234567"
            className={`input input-bordered ${errors.phone ? "input-error" : ""}`}
            value={form.phone}
            onChange={(e) => update("phone", e.target.value)}
          />
          <span className="text-xs text-base-content/50 mt-1">
            Formato: 258 seguido de 9 dígitos
          </span>
          {errors.phone && <span className="text-error text-xs mt-1">{errors.phone}</span>}
        </div>

        <div className="form-control">
          <label className="label cursor-pointer justify-start gap-3">
            <input
              type="checkbox"
              className="checkbox checkbox-primary"
              checked={form.consent}
              onChange={(e) => update("consent", e.target.checked)}
            />
            <span className="label-text text-sm">
              Autorizo a Ephula a usar os meus dados para recomendações
              agrícolas, conforme a Lei 23/2021 de Protecção de Dados de
              Moçambique
            </span>
          </label>
          {errors.consent && <span className="text-error text-xs mt-1">{errors.consent}</span>}
        </div>

        <div className="md:col-span-2 divider">Dados da Machamba</div>

        <div className="form-control">
          <label className="label">
            <span className="label-text">Área (ha)*</span>
          </label>
          <input
            type="number"
            step={0.1}
            min={0.1}
            max={50}
            className={`input input-bordered ${errors.area_ha ? "input-error" : ""}`}
            value={form.area_ha}
            onChange={(e) => update("area_ha", e.target.value)}
          />
          {errors.area_ha && <span className="text-error text-xs mt-1">{errors.area_ha}</span>}
        </div>

        <div className="form-control">
          <label className="label">
            <span className="label-text">Cultura*</span>
          </label>
          <select
            className="select select-bordered"
            value={form.crop}
            onChange={(e) => update("crop", e.target.value)}
          >
            {CROPS.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        </div>

        <div className="form-control">
          <label className="label">
            <span className="label-text">Variedade</span>
          </label>
          <input
            type="text"
            className="input input-bordered"
            value={form.variety}
            onChange={(e) => update("variety", e.target.value)}
          />
        </div>

        <div className="flex items-center gap-8 pt-6">
          <label className="label cursor-pointer gap-3">
            <span className="label-text">Aplica fertilizante</span>
            <input
              type="checkbox"
              className="toggle toggle-primary"
              checked={form.has_fertilizer}
              onChange={(e) => update("has_fertilizer", e.target.checked)}
            />
          </label>
          <label className="label cursor-pointer gap-3">
            <span className="label-text">Tem acesso a rega</span>
            <input
              type="checkbox"
              className="toggle toggle-primary"
              checked={form.has_irrigation}
              onChange={(e) => update("has_irrigation", e.target.checked)}
            />
          </label>
        </div>

        <div className="form-control">
          <label className="label">
            <span className="label-text">Latitude</span>
          </label>
          <input
            type="number"
            step={0.0001}
            placeholder="-25.9"
            className="input input-bordered"
            value={form.location_lat}
            onChange={(e) => update("location_lat", e.target.value)}
          />
        </div>

        <div className="form-control">
          <label className="label">
            <span className="label-text">Longitude</span>
          </label>
          <input
            type="number"
            step={0.0001}
            placeholder="32.6"
            className="input input-bordered"
            value={form.location_lon}
            onChange={(e) => update("location_lon", e.target.value)}
          />
        </div>

        <div className="md:col-span-2">
          <button type="submit" className="btn btn-primary w-full" disabled={submitting}>
            {submitting ? (
              <span className="loading loading-spinner loading-sm" />
            ) : (
              "Registar Agricultor"
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
