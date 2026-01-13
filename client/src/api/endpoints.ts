export const API_BASE = "/api";

export const endpoints = {
  auth: {
    register: `${API_BASE}/auth/register`,
    login: `${API_BASE}/auth/login`,
    logout: `${API_BASE}/auth/logout`,
    me: `${API_BASE}/auth/me`,
  },
  flights: {
    list: `${API_BASE}/flights`,
    byId: (id: number | string) => `${API_BASE}/flights/${id}`,
  },
  airlines: {
    list: `${API_BASE}/airlines`,
  },
  purchases: {
    create: `${API_BASE}/purchases`,
    mine: `${API_BASE}/purchases/me`,
    byId: (id: number | string) => `${API_BASE}/purchases/${id}`,
  },
} as const;
