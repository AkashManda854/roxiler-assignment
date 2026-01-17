import React from "react";
import { useAuth } from "../context/AuthContext";

const TopBar = ({ title }) => {
  const { user, logout } = useAuth();
  return (
    <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 16 }}>
      <h2>{title}</h2>
      <div>
        <span style={{ marginRight: 12 }}>{user?.name} ({user?.role})</span>
        <button onClick={logout}>Logout</button>
      </div>
    </div>
  );
};

export default TopBar;
