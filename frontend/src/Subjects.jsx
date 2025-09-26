import React, { useState, useEffect } from "react";
import "./Subjects.css";

function Subjects() {
  const [subjects, setSubjects] = useState([]);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [success, setSuccess] = useState("");
  const [error, setError] = useState("");

  // Track edit mode
  const [editId, setEditId] = useState(null);

  // ✅ Fetch subjects
  const fetchSubjects = async () => {
    try {
      const response = await fetch("http://localhost:8081/api/subjects");
      if (!response.ok) throw new Error("Failed to fetch subjects");
      const data = await response.json();
      setSubjects(data);
    } catch (err) {
      setError("❌ " + err.message);
    }
  };

  useEffect(() => {
    fetchSubjects();
  }, []);

  // ✅ Add or Update subject
  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const url = editId
        ? `http://backend:8081/api/subjects/${editId}`
        : "http://localhost:8081/api/subjects";

      const method = editId ? "PUT" : "POST";

      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title, description }),
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Operation failed");

      setSuccess("✅ " + data.message);
      setError("");
      setTitle("");
      setDescription("");
      setEditId(null);

      fetchSubjects();
    } catch (err) {
      setError("❌ " + err.message);
      setSuccess("");
    }
  };

  // ✅ Delete subject
  const deleteSubject = async (id) => {
    try {
      const response = await fetch(`http://localhost:8081/api/subjects/${id}`, {
        method: "DELETE",
      });
      const data = await response.json();

      if (!response.ok) throw new Error(data.error || "Failed to delete subject");

      setSuccess("✅ " + data.message);
      fetchSubjects();
    } catch (err) {
      setError("❌ " + err.message);
    }
  };

  // ✅ Start editing
  const startEdit = (subj) => {
    setEditId(subj.id);
    setTitle(subj.title);
    setDescription(subj.description);
  };

  return (
    <div className="subjects-container">
      <h2>📚 Subjects</h2>

      {/* Form */}
      <form className="subjects-form" onSubmit={handleSubmit}>
        <input
          type="text"
          placeholder="Enter subject title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
        />
        <textarea
          placeholder="Enter description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
        ></textarea>
        <button type="submit">{editId ? "Update Subject" : "Add Subject"}</button>
      </form>

      {/* Messages */}
      {success && <p style={{ color: "green" }}>{success}</p>}
      {error && <p style={{ color: "red" }}>{error}</p>}

      {/* Table */}
      <table className="subjects-table">
        <thead>
          <tr>
            <th>ID</th>
            <th>Title</th>
            <th>Description</th>
            <th>Action</th>
          </tr>
        </thead>
        <tbody>
          {subjects.map((subj) => (
            <tr key={subj.id}>
              <td>{subj.id}</td>
              <td>{subj.title}</td>
              <td>{subj.description}</td>
              <td>
                <button
                  className="edit-btn"
                  onClick={() => startEdit(subj)}
                >
                  ✏️ Edit
                </button>
                <button
                  className="delete-btn"
                  onClick={() => deleteSubject(subj.id)}
                >
                  ❌ Delete
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default Subjects;
