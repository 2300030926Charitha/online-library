import React, { useEffect, useState } from "react";
import "./App.css";

const Authors = () => {
  const [authors, setAuthors] = useState([]);
  const [name, setName] = useState("");
  const [bio, setBio] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // Fetch authors
  const fetchAuthors = async () => {
    try {
      const res = await fetch("http://localhost:8081/api/authors");
      if (!res.ok) throw new Error("Failed to fetch authors");
      const data = await res.json();
      setAuthors(data);
    } catch (err) {
      setError("❌ " + err.message);
    }
  };

  useEffect(() => {
    fetchAuthors();
  }, []);

  // Add author
  const addAuthor = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch("http://localhost:8081/api/authors", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, bio }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to add author");

      setSuccess("✅ " + data.message);
      setError("");
      setName("");
      setBio("");
      fetchAuthors();
    } catch (err) {
      setError("❌ " + err.message);
      setSuccess("");
    }
  };

  return (
    <div className="books-container">
      <h2>👨‍💻 Authors Management</h2>

      {error && <div style={{ color: "red", marginBottom: "10px" }}>{error}</div>}
      {success && <div style={{ color: "green", marginBottom: "10px" }}>{success}</div>}

      {/* Add Author Form */}
      <form onSubmit={addAuthor} className="books-form">
        <input
          type="text"
          placeholder="Enter Author Name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
        />
        <input
          type="text"
          placeholder="Enter Author Bio"
          value={bio}
          onChange={(e) => setBio(e.target.value)}
          required
        />
        <button type="submit">Add Author</button>
      </form>

      {/* Authors Table */}
      <table className="books-table">
        <thead>
          <tr>
            <th>ID</th>
            <th>✍️ Name</th>
            <th>📖 Bio</th>
          </tr>
        </thead>
        <tbody>
          {authors.length > 0 ? (
            authors.map((author) => (
              <tr key={author.id}>
                <td>{author.id}</td>
                <td>{author.name}</td>
                <td>{author.bio}</td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan="3">No authors found.</td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
};

export default Authors;
