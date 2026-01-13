import axios from "axios";

export const http = axios.create({
  baseURL: "", // kasnije možeš staviti npr. "http://localhost:5000"
});

http.interceptors.request.use((config) => {
  const token = localStorage.getItem("access_token");
  if (token) {
    config.headers = config.headers ?? {};
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});
