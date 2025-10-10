import React, { useState, useEffect } from "react";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import "./Authors.css";

function Authors() {
  const [authors, setAuthors] = useState([]);
  const [name, setName] = useState("");
  const [bio, setBio] = useState("");
  const [editId, setEditId] = useState(null);

  const token = localStorage.getItem("token") || "";
  const loggedInRole = localStorage.getItem("role") || "";

  const API_URL = "http://localhost:8081/api/authors";

  // ✅ Fetch authors
  const fetchAuthors = async () => {
    try {
      const res = await fetch(API_URL, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error("Failed to fetch authors");
      const data = await res.json();
      setAuthors(data);
    } catch (err) {
      toast.error("❌ " + err.message);
    }
  };

  useEffect(() => {
    fetchAuthors();
  }, [token]);

  // ✅ Add author
  const addAuthor = async (e) => {
    e.preventDefault();
    if (!["ADMIN"].includes(loggedInRole)) {
      return toast.error("❌ Only admins can add authors");
    }
    try {
      const res = await fetch(API_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ name, bio }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to add author");
      toast.success(`✅ Author "${name}" added!`);
      setName("");
      setBio("");
      fetchAuthors();
    } catch (err) {
      toast.error("❌ " + err.message);
    }
  };

  // ✅ Edit author
  const startEdit = (author) => {
    setEditId(author.id);
    setName(author.name);
    setBio(author.bio);
  };

  const submitEdit = async (e) => {
    e.preventDefault();
    if (!editId) return;
    try {
      const res = await fetch(`${API_URL}/${editId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ name, bio }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Update failed");
      toast.success(`✏️ "${name}" updated!`);
      setEditId(null);
      setName("");
      setBio("");
      fetchAuthors();
    } catch (err) {
      toast.error("❌ " + err.message);
    }
  };

  // ✅ Delete author
  const deleteAuthor = async (id) => {
    try {
      const res = await fetch(`${API_URL}/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Delete failed");
      toast.success("✅ Author deleted!");
      fetchAuthors();
    } catch (err) {
      toast.error("❌ " + err.message);
    }
  };

  return (
    <div className="authors-container">
      <h2>👩‍💻 Authors Management</h2>
      <ToastContainer position="top-right" autoClose={3000} />

      <form onSubmit={editId ? submitEdit : addAuthor}>
        <input
          type="text"
          placeholder="Name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
        />
        <input
          type="text"
          placeholder="Bio"
          value={bio}
          onChange={(e) => setBio(e.target.value)}
          required
        />
        <button type="submit">{editId ? "✏️ Update" : "➕ Add Author"}</button>
        {editId && (
          <button type="button" onClick={() => { setEditId(null); setName(""); setBio(""); }}>
            ❌ Cancel
          </button>
        )}
      </form>

      <table className="authors-table">
        <thead>
          <tr>
            <th>ID</th>
            <th>Name</th>
            <th>Bio</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {authors.length > 0 ? (
            authors.map(a => (
              <tr key={a.id}>
                <td>{a.id}</td>
                <td>{a.name}</td>
                <td>{a.bio}</td>
                <td>
                  <button onClick={() => startEdit(a)}>✏️ Edit</button>
                  <button onClick={() => deleteAuthor(a.id)}>🗑️ Delete</button>
                </td>
              </tr>
            ))
          ) : (
            <tr><td colSpan="4">No authors found</td></tr>
          )}
        </tbody>
      </table>
    </div>
  );
}

export default Authors;
