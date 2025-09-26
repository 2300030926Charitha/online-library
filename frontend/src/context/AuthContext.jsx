import React, { createContext, useState, useEffect } from "react";

export const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [token, setToken] = useState(() => localStorage.getItem("token"));

  // Keep localStorage in sync
  useEffect(() => {
    if (token) localStorage.setItem("token", token);
    else localStorage.removeItem("token");
  }, [token]);

  const login = (jwt) => {
    setToken(jwt);
    // localStorage updated via effect, but set explicitly too
    localStorage.setItem("token", jwt);
  };

  const logout = () => {
    setToken(null);
    localStorage.removeItem("token");
    // redirect to home
    window.location.href = "/";
  };

  return (
    <AuthContext.Provider value={{ token, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};
