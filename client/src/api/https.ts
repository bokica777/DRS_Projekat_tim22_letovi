import axios from "axios";

const API_URL = (import.meta.env.VITE_API_URL ?? "").replace(/\/$/, "");

export const http = axios.create({
  baseURL: API_URL,   
});

http.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");

  if (token) {
    config.headers = config.headers ?? {};
    const h: any = config.headers;
    if (typeof h.set === "function") h.set("Authorization", `Bearer ${token}`);
    else h["Authorization"] = `Bearer ${token}`;
  }

  return config;
});
