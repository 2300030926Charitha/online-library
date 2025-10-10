import React, { useState, useEffect } from "react";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import "./Subjects.css";

function Subjects() {
  const [subjects, setSubjects] = useState([]);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [editId, setEditId] = useState(null);

  const loggedInRole = localStorage.getItem("role") || "";
  const token = localStorage.getItem("token") || "";

  // ✅ Redirect if no token or expired
  useEffect(() => {
    if (!token) {
      toast.error("❌ Session expired. Please log in again.");
      window.location.href = "/login";
    }
  }, [token]);

  // ✅ Fetch subjects
  const fetchSubjects = async () => {
    try {
      const res = await fetch("http://localhost:8081/api/subjects", {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error("Failed to fetch subjects");
      const data = await res.json();
      setSubjects(data);
    } catch (err) {
      toast.error("❌ " + err.message);
    }
  };

  useEffect(() => {
    fetchSubjects(); // fetch subjects on load
  }, []);

  // ✅ Add new subject
  const addSubject = async (e) => {
    e.preventDefault();
    if (!["ADMIN"].includes(loggedInRole)) {
      return toast.error("❌ Only admins can add subjects");
    }

    try {
      const res = await fetch("http://localhost:8081/api/subjects", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ name, description }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to add subject");
      toast.success(`✅ Subject "${name}" added successfully!`);
      setName("");
      setDescription("");
      fetchSubjects();
    } catch (err) {
      toast.error("❌ " + err.message);
    }
  };

  // ✅ Edit subject
  const submitEdit = async (e) => {
    e.preventDefault();
    if (!editId) return;

    if (!["ADMIN"].includes(loggedInRole)) {
      return toast.error("❌ Only admins can edit subjects");
    }

    try {
      const res = await fetch(`http://localhost:8081/api/subjects/${editId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ name, description }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Update failed");
      toast.success(`✏️ Subject "${name}" updated successfully!`);
      setEditId(null);
      setName("");
      setDescription("");
      fetchSubjects();
    } catch (err) {
      toast.error("❌ " + err.message);
    }
  };

  // ✅ Delete subject
  const deleteSubject = async (id) => {
    if (!["ADMIN"].includes(loggedInRole)) {
      return toast.error("❌ Only admins can delete subjects");
    }

    try {
      const res = await fetch(`http://localhost:8081/api/subjects/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to delete subject");
      toast.success("🗑️ Subject deleted successfully!");
      fetchSubjects();
    } catch (err) {
      toast.error("❌ " + err.message);
    }
  };

  // ✅ Start editing
  const startEdit = (subject) => {
    setEditId(subject.id);
    setName(subject.name);
    setDescription(subject.description);
  };

  // ✅ Cancel editing
  const cancelEdit = () => {
    setEditId(null);
    setName("");
    setDescription("");
  };

  return (
    <div className="subjects-container">
      <h2>📘 Subjects Management</h2>
      <ToastContainer position="top-right" autoClose={3000} />

      <form className="subjects-form" onSubmit={editId ? submitEdit : addSubject}>
        <input
          type="text"
          placeholder="Enter Subject Name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
        />
        <input
          type="text"
          placeholder="Enter Subject Description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          required
        />
        <button type="submit">{editId ? "✏️ Update Subject" : "Add Subject"}</button>
        {editId && (
          <button type="button" onClick={cancelEdit}>
            ❌ Cancel
          </button>
        )}
      </form>

      <button className="load-btn" onClick={fetchSubjects} style={{ margin: "10px 0" }}>
        🔄 Refresh Subjects
      </button>

      <table className="subjects-table">
        <thead>
          <tr>
            <th>ID</th>
            <th>📚 Name</th>
            <th>📝 Description</th>
            <th>⚙️ Actions</th>
          </tr>
        </thead>
        <tbody>
          {subjects.length > 0 ? (
            subjects.map((subject) => (
              <tr key={subject.id}>
                <td>{subject.id}</td>
                <td>{subject.name}</td>
                <td>{subject.description}</td>
                <td>
                  {loggedInRole === "ADMIN" && (
                    <>
                      <button className="edit-btn" onClick={() => startEdit(subject)}>
                        ✏️ Edit
                      </button>
                      <button className="delete-btn" onClick={() => deleteSubject(subject.id)}>
                        🗑️ Delete
                      </button>
                    </>
                  )}
                  {loggedInRole !== "ADMIN" && <span>🔒 View only</span>}
                </td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan="4">No subjects found.</td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}

export default Subjects;
