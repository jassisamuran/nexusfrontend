import { useEffect, useState } from "react";
import { clearToken, getMe } from "../api";

export function useAuth() {
  const [user, setUser] = useState();
  const [loading, setLoading] = useState();

  useEffect(() => {
    getMe()
      .then(setUser)
      .catch(() => setUser(null))
      .finally(() => setLoading(false));
  }, []);

  function logout() {
    clearToken();
    window.location.href = "/login";
  }

  function refreshUser() {
    getMe().then(setUser);
  }

  return { user, loading, logout, refreshUser };
}
