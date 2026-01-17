import React, { useEffect, useState } from "react";
import api from "../services/api";
import TopBar from "../components/TopBar";

const AdminDashboard = () => {
  const [counts, setCounts] = useState({ users: 0, stores: 0, ratings: 0 });
  const [users, setUsers] = useState([]);
  const [stores, setStores] = useState([]);
  const [userFilters, setUserFilters] = useState({ name: "", email: "", address: "", role: "" });
  const [storeFilters, setStoreFilters] = useState({ name: "", email: "", address: "" });
  const [userSort, setUserSort] = useState({ sortBy: "name", sortOrder: "asc" });
  const [storeSort, setStoreSort] = useState({ sortBy: "name", sortOrder: "asc" });
  const [newUser, setNewUser] = useState({ name: "", email: "", address: "", password: "", role: "user" });
  const [newStore, setNewStore] = useState({ name: "", email: "", address: "", owner_id: "" });
  const [passwordForm, setPasswordForm] = useState({ currentPassword: "", newPassword: "" });
  const [error, setError] = useState(null);

  const loadDashboard = async () => {
    const { data } = await api.get("/api/admin/dashboard");
    setCounts(data);
  };

  const loadUsers = async () => {
    const params = { ...userFilters, ...userSort };
    const { data } = await api.get("/api/admin/users", { params });
    setUsers(data.users || []);
  };

  const loadStores = async () => {
    const params = { ...storeFilters, ...storeSort };
    const { data } = await api.get("/api/admin/stores", { params });
    setStores(data.stores || []);
  };

  useEffect(() => {
    loadDashboard();
    loadUsers();
    loadStores();
  }, []);

  const handleCreateUser = async (e) => {
    e.preventDefault();
    setError(null);
    try {
      await api.post("/api/admin/users", newUser);
      setNewUser({ name: "", email: "", address: "", password: "", role: "user" });
      loadUsers();
      loadDashboard();
    } catch (err) {
      setError(err.response?.data?.error || err.response?.data?.errors?.[0]?.msg || "Failed to create user");
    }
  };

  const handleCreateStore = async (e) => {
    e.preventDefault();
    setError(null);
    try {
      await api.post("/api/admin/stores", {
        ...newStore,
        owner_id: newStore.owner_id ? Number(newStore.owner_id) : null,
      });
      setNewStore({ name: "", email: "", address: "", owner_id: "" });
      loadStores();
      loadDashboard();
    } catch (err) {
      setError(err.response?.data?.error || err.response?.data?.errors?.[0]?.msg || "Failed to create store");
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
      <TopBar title="Admin Dashboard" />
      {error && <p style={{ color: "red" }}>{error}</p>}

      <section>
        <h3>Summary</h3>
        <p>Users: {counts.users} | Stores: {counts.stores} | Ratings: {counts.ratings}</p>
      </section>

      <section>
        <h3>Create User</h3>
        <form onSubmit={handleCreateUser}>
          <input placeholder="Name" value={newUser.name} onChange={(e) => setNewUser({ ...newUser, name: e.target.value })} required />
          <input placeholder="Email" value={newUser.email} onChange={(e) => setNewUser({ ...newUser, email: e.target.value })} required />
          <input placeholder="Address" value={newUser.address} onChange={(e) => setNewUser({ ...newUser, address: e.target.value })} />
          <input type="password" placeholder="Password" value={newUser.password} onChange={(e) => setNewUser({ ...newUser, password: e.target.value })} required />
          <select value={newUser.role} onChange={(e) => setNewUser({ ...newUser, role: e.target.value })}>
            <option value="user">user</option>
            <option value="admin">admin</option>
            <option value="owner">owner</option>
          </select>
          <button type="submit">Add User</button>
        </form>
      </section>

      <section>
        <h3>Create Store</h3>
        <form onSubmit={handleCreateStore}>
          <input placeholder="Name" value={newStore.name} onChange={(e) => setNewStore({ ...newStore, name: e.target.value })} required />
          <input placeholder="Email" value={newStore.email} onChange={(e) => setNewStore({ ...newStore, email: e.target.value })} required />
          <input placeholder="Address" value={newStore.address} onChange={(e) => setNewStore({ ...newStore, address: e.target.value })} />
          <input placeholder="Owner ID (optional)" value={newStore.owner_id} onChange={(e) => setNewStore({ ...newStore, owner_id: e.target.value })} />
          <button type="submit">Add Store</button>
        </form>
      </section>

      <section>
        <h3>Users</h3>
        <div>
          <input placeholder="Name" value={userFilters.name} onChange={(e) => setUserFilters({ ...userFilters, name: e.target.value })} />
          <input placeholder="Email" value={userFilters.email} onChange={(e) => setUserFilters({ ...userFilters, email: e.target.value })} />
          <input placeholder="Address" value={userFilters.address} onChange={(e) => setUserFilters({ ...userFilters, address: e.target.value })} />
          <input placeholder="Role" value={userFilters.role} onChange={(e) => setUserFilters({ ...userFilters, role: e.target.value })} />
          <select value={userSort.sortBy} onChange={(e) => setUserSort({ ...userSort, sortBy: e.target.value })}>
            <option value="name">name</option>
            <option value="email">email</option>
            <option value="role">role</option>
          </select>
          <select value={userSort.sortOrder} onChange={(e) => setUserSort({ ...userSort, sortOrder: e.target.value })}>
            <option value="asc">asc</option>
            <option value="desc">desc</option>
          </select>
          <button onClick={loadUsers}>Apply</button>
        </div>
        <table border="1" cellPadding="6">
          <thead>
            <tr>
              <th>Name</th>
              <th>Email</th>
              <th>Address</th>
              <th>Role</th>
            </tr>
          </thead>
          <tbody>
            {users.map((u) => (
              <tr key={u.id}>
                <td>{u.name}</td>
                <td>{u.email}</td>
                <td>{u.address || "-"}</td>
                <td>{u.role}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>

      <section>
        <h3>Stores</h3>
        <div>
          <input placeholder="Name" value={storeFilters.name} onChange={(e) => setStoreFilters({ ...storeFilters, name: e.target.value })} />
          <input placeholder="Email" value={storeFilters.email} onChange={(e) => setStoreFilters({ ...storeFilters, email: e.target.value })} />
          <input placeholder="Address" value={storeFilters.address} onChange={(e) => setStoreFilters({ ...storeFilters, address: e.target.value })} />
          <select value={storeSort.sortBy} onChange={(e) => setStoreSort({ ...storeSort, sortBy: e.target.value })}>
            <option value="name">name</option>
            <option value="email">email</option>
          </select>
          <select value={storeSort.sortOrder} onChange={(e) => setStoreSort({ ...storeSort, sortOrder: e.target.value })}>
            <option value="asc">asc</option>
            <option value="desc">desc</option>
          </select>
          <button onClick={loadStores}>Apply</button>
        </div>
        <table border="1" cellPadding="6">
          <thead>
            <tr>
              <th>Name</th>
              <th>Email</th>
              <th>Address</th>
              <th>Avg Rating</th>
            </tr>
          </thead>
          <tbody>
            {stores.map((s) => (
              <tr key={s.id}>
                <td>{s.name}</td>
                <td>{s.email}</td>
                <td>{s.address || "-"}</td>
                <td>{Number(s.avg_rating).toFixed(2)}</td>
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

export default AdminDashboard;
