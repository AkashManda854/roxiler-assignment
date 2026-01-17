import React, { useEffect, useState } from "react";
import api from "../services/api";
import TopBar from "../components/TopBar";

const OwnerDashboard = () => {
  const [data, setData] = useState(null);
  const [passwordForm, setPasswordForm] = useState({ currentPassword: "", newPassword: "" });
  const [error, setError] = useState(null);

  const loadDashboard = async () => {
    const res = await api.get("/api/owner/dashboard");
    setData(res.data);
  };

  useEffect(() => {
    loadDashboard();
  }, []);

  const updatePassword = async (e) => {
    e.preventDefault();
    setError(null);
    try {
      await api.patch("/api/auth/password", passwordForm);
      setPasswordForm({ currentPassword: "", newPassword: "" });
    } catch (err) {
      setError(err.response?.data?.error || err.response?.data?.errors?.[0]?.msg || "Failed to update password");
    }
  };

  return (
    <div style={{ padding: 24 }}>
      <TopBar title="Owner Dashboard" />
      {error && <p style={{ color: "red" }}>{error}</p>}

      {data && (
        <section>
          <h3>{data.store.name}</h3>
          <p>Average Rating: {data.avg_rating || "N/A"}</p>
        </section>
      )}

      <section>
        <h3>Raters</h3>
        <table border="1" cellPadding="6">
          <thead>
            <tr>
              <th>User</th>
              <th>Email</th>
              <th>Rating</th>
              <th>Date</th>
            </tr>
          </thead>
          <tbody>
            {data?.raters?.map((r) => (
              <tr key={`${r.user_id}-${r.created_at}`}>
                <td>{r.name}</td>
                <td>{r.email}</td>
                <td>{r.rating}</td>
                <td>{new Date(r.created_at).toLocaleString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>

      <section>
        <h3>Update Password</h3>
        <form onSubmit={updatePassword}>
          <input
            type="password"
            placeholder="Current Password"
            value={passwordForm.currentPassword}
            onChange={(e) => setPasswordForm({ ...passwordForm, currentPassword: e.target.value })}
            required
          />
          <input
            type="password"
            placeholder="New Password"
            value={passwordForm.newPassword}
            onChange={(e) => setPasswordForm({ ...passwordForm, newPassword: e.target.value })}
            required
          />
          <button type="submit">Update Password</button>
        </form>
      </section>
    </div>
  );
};

export default OwnerDashboard;
