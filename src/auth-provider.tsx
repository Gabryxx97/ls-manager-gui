// src/authProvider.ts
import { AuthProvider } from "react-admin";
import { apiUrl, httpRequest } from "./http-client";

type AuthUser = {
  id: number | string;
  username: string;
  role: string;
  name?: string;
  surname?: string;
  companyName?: string;
};

const authProvider: AuthProvider = {
  login: async ({ username, password }) => {
    await httpRequest(`${apiUrl}/login`, {
      method: "POST",
      body: JSON.stringify({ username, password }),
    }, false);
    const { json: user } = await httpRequest<AuthUser>(`${apiUrl}/me`);
    localStorage.setItem("auth", JSON.stringify(user));
    localStorage.setItem("role", user.role);
    localStorage.setItem(
      "fullName",
      user.name ? `${user.name} ${user.surname ?? ""}`.trim() : (user.companyName ?? user.username),
    );
    return Promise.resolve();
  },
  logout: async () => {
    try {
      await httpRequest(`${apiUrl}/logout`, { method: "POST" }, false);
    } finally {
      localStorage.clear();
    }
  },

  checkAuth: () => {
    // Se non ho user in storage, vuol dire che non sono loggato
    return localStorage.getItem("auth") ? Promise.resolve() : Promise.reject();
  },

  checkError: (error) => {
    if (error.status === 401) {
      localStorage.clear();
      return Promise.reject();
    }
    return Promise.resolve();
  },

  getIdentity: () => {
    // Restituisco l'identità da localStorage (popolato in login)
    const stored = localStorage.getItem("auth");
    if (!stored) {
      return Promise.reject();
    }
    const user = JSON.parse(stored);
    const fullName = localStorage.getItem("fullName") || "";
    return Promise.resolve({
      id: user.id,
      fullName,
    });
  },

  getPermissions: () => {
    const role = localStorage.getItem("role");
    return role ? Promise.resolve(role) : Promise.reject();
  },
};

export default authProvider;
