import React, { useEffect, useState } from "react";
import api from "../services/api";
import TopBar from "../components/TopBar";

const UserDashboard = () => {
  const [stores, setStores] = useState([]);
  const [search, setSearch] = useState({ name: "", address: "" });
  const [passwordForm, setPasswordForm] = useState({ currentPassword: "", newPassword: "" });
  const [error, setError] = useState(null);

  const loadStores = async () => {
    const { data } = await api.get("/api/user/stores", { params: search });
    setStores(data.stores || []);
  };

  useEffect(() => {
    loadStores();
  }, []);

  const submitRating = async (storeId, rating, hasExisting) => {
    setError(null);
    try {
      if (hasExisting) {
        await api.patch(`/api/user/ratings/${storeId}`, { rating: Number(rating) });
      } else {
        await api.post("/api/user/ratings", { store_id: storeId, rating: Number(rating) });
      }
      loadStores();
    } catch (err) {
      setError(err.response?.data?.error || err.response?.data?.errors?.[0]?.msg || "Failed to submit rating");
    }
  };

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
      <TopBar title="User Dashboard" />
      {error && <p style={{ color: "red" }}>{error}</p>}

      <section>
        <h3>Search Stores</h3>
        <input placeholder="Name" value={search.name} onChange={(e) => setSearch({ ...search, name: e.target.value })} />
        <input placeholder="Address" value={search.address} onChange={(e) => setSearch({ ...search, address: e.target.value })} />
        <button onClick={loadStores}>Search</button>
      </section>

      <section>
        <h3>Stores</h3>
        <table border="1" cellPadding="6">
          <thead>
            <tr>
              <th>Name</th>
              <th>Address</th>
              <th>Avg Rating</th>
              <th>Your Rating</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {stores.map((s) => (
              <StoreRow key={s.id} store={s} onSubmit={submitRating} />
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

const StoreRow = ({ store, onSubmit }) => {
  const [rating, setRating] = useState(store.user_rating || "");
  const hasExisting = !!store.user_rating;

  return (
    <tr>
      <td>{store.name}</td>
      <td>{store.address || "-"}</td>
      <td>{Number(store.avg_rating).toFixed(2)}</td>
      <td>
        <input
          value={rating}
          onChange={(e) => setRating(e.target.value)}
          placeholder="1-5"
        />
      </td>
      <td>
        <button onClick={() => onSubmit(store.id, rating, hasExisting)}>
          {hasExisting ? "Update" : "Submit"}
        </button>
      </td>
    </tr>
  );
};

export default UserDashboard;
