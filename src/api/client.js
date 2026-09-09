import axios from "axios";

// In dev, Vite proxies /api to localhost:8000 (vite.config.js), so "" works.
// In production the frontend and backend are on different hosts, so set
// VITE_API_BASE_URL to the deployed API's origin (e.g. https://ephula-api.onrender.com).
const api = axios.create({ baseURL: import.meta.env.VITE_API_BASE_URL ?? "" });

export async function getFarmers() {
  const { data } = await api.get("/api/v1/farmers");
  return data;
}

export async function getProgram(programId) {
  const { data } = await api.get(`/api/v1/programs/${programId}`);
  return data;
}

export async function getProgramMessages(programId) {
  const { data } = await api.get(`/api/v1/programs/${programId}/messages`);
  return data;
}

export async function getPlantingWindow(machambaId) {
  const { data } = await api.get(`/api/v1/climate/planting-window/${machambaId}`);
  return data;
}

export async function registerFarmer(payload) {
  const { data } = await api.post("/api/v1/farmers", payload);
  return data;
}

export async function processInboundSMS(phone, text) {
  const body = new URLSearchParams({ from: phone, text });
  const { data } = await api.post("/api/v1/sms/inbound", body, {
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
  });
  return data;
}

export async function triggerEngine() {
  const { data } = await api.post("/api/v1/engine/trigger");
  return data;
}
