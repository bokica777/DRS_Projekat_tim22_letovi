export const API_BASE = "/api";

export const endpoints = {
  auth: {
    register: `${API_BASE}/users/register`,
    login: `${API_BASE}/auth/login`,
    logout: `${API_BASE}/auth/logout`,
    me: `${API_BASE}/auth/me`,
  },

  flights: {
    list: `${API_BASE}/flights`,
    byId: (id: number | string) => `${API_BASE}/flights/${id}`,
  },

  airlines: {
    list: `${API_BASE}/companies`,
  },

  users: {
    deposit: `${API_BASE}/users/deposit`,
    me: `${API_BASE}/users/me`,
    updateMe: `${API_BASE}/users/me`,
    uploadImage: `${API_BASE}/users/me/image`,
  },

  purchases: {
    create: `${API_BASE}/tickets/buy`,
    mine: `${API_BASE}/tickets/my`,
  },

  admin: {
    approve: (id: number | string) => `${API_BASE}/admin/flights/${id}/approve`,
    reject: (id: number | string) => `${API_BASE}/admin/flights/${id}/reject`,
    cancel: (id: number | string) => `${API_BASE}/admin/flights/${id}/cancel`,
    delete: (id: number | string) => `${API_BASE}/admin/flights/${id}`,
    report: `${API_BASE}/admin/flights/report`,
    users: `${API_BASE}/admin/users`,
    userRole: (id: number | string) => `${API_BASE}/admin/users/${id}/role`,
    userById: (id: number | string) => `${API_BASE}/admin/users/${id}`,
    ratings: `${API_BASE}/ratings/admin`,
  },

  ratings: {
    list: `${API_BASE}/ratings`,
    my: `${API_BASE}/ratings/my`,
    create: `${API_BASE}/ratings`,
    admin: `${API_BASE}/ratings/admin`,
  },

  tickets: {
    buy: `${API_BASE}/tickets/buy`,
    my: `${API_BASE}/tickets/my`,
  },
} as const;
