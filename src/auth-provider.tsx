// src/authProvider.ts
import { AuthProvider } from "react-admin";

const BACKEND = import.meta.env.VITE_BACKEND_URL;

const authProvider: AuthProvider = {
  login: async ({ username, password }) => {
    const res = await fetch(`${BACKEND}/api/login`, {
      method: "POST",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, password }),
    });
    if (res.status === 401) {
      const data = await res.json();
      throw new Error(data.message || "Credenziali non valide");
    }
    if (!res.ok) {
      throw new Error(res.statusText || "Errore di autenticazione");
    }
    const meRes = await fetch(`${BACKEND}/api/me`, { credentials: "include" });
    if (!meRes.ok) {
      throw new Error("Impossibile recuperare il profilo utente");
    }
    const user = await meRes.json();
    localStorage.setItem("auth", JSON.stringify(user));
    localStorage.setItem("role", user.role);
    localStorage.setItem(
      "fullName",
      user.name ? `${user.name} ${user.surname}` : user.companyName,
    );
    return Promise.resolve();
  },
  logout: async () => {
    await fetch(`${BACKEND}/api/logout`, {
      method: "POST",
      credentials: "include",
    });
    localStorage.clear();
    return Promise.resolve();
  },

  checkAuth: () => {
    // Se non ho user in storage, vuol dire che non sono loggato
    return localStorage.getItem("auth") ? Promise.resolve() : Promise.reject();
  },

  checkError: (error) => {
    if (error.status === 401 || error.status === 403) {
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
