import { useState } from "react";
import { AuthContext } from "./AuthContext.js";
import { CACHE_STORAGE_KEY } from "../services/CachePersistence.js";

export function AuthProvider({ children }) {
  const [authToken, setAuthToken] = useState(() =>
    localStorage.getItem("anilist_token"),
  );

  const clearCache = () => {
    localStorage.removeItem(CACHE_STORAGE_KEY);
  };

  const login = (token) => {
    clearCache();
    localStorage.setItem("anilist_token", token);
    setAuthToken(token);
  };

  const logout = () => {
    clearCache();
    localStorage.removeItem("anilist_token");
    setAuthToken(null);
  };

  return (
    <AuthContext.Provider value={{ authToken, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}
