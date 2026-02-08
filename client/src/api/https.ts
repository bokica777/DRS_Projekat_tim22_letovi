import axios from "axios";

export const http = axios.create({
  baseURL: "",
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
