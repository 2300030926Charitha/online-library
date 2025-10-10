import React, { useState, useEffect } from "react";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import "./Books.css";

function Books() {
  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [title, setTitle] = useState("");
  const [year, setYear] = useState("");
  const [file, setFile] = useState(null);
  const [editId, setEditId] = useState(null);
  const [editFile, setEditFile] = useState(null);

  // Logged-in user info
  const loggedInUser = localStorage.getItem("username") || "";
  const loggedInRole = localStorage.getItem("role") || "";
  const token = localStorage.getItem("token") || "";

  const API_URL = "http://localhost:8081/api/books";

  // Fetch all books with proper error handling
  const fetchBooks = async () => {
    if (!token) {
      toast.error("❌ You must be logged in to fetch books");
      setLoading(false);
      return;
    }

    setLoading(true);
    try {
      const res = await fetch(API_URL, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (res.status === 401) {
        throw new Error("Unauthorized! Please log in again.");
      }

      if (!res.ok) {
        throw new Error(`Failed to fetch books (${res.status})`);
      }

      const data = await res.json();
      setBooks(data);
    } catch (err) {
      toast.error("❌ " + err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBooks();
  }, [token]);

  // Upload or update book
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!["AUTHOR", "ADMIN"].includes(loggedInRole)) {
      toast.error("❌ Only authors or admins can upload books");
      return;
    }

    if (!editId && !file) {
      toast.error("📁 Please select a file to upload");
      return;
    }

    const formData = new FormData();
    formData.append("title", title);
    formData.append("year", parseInt(year));
    if (editId && editFile) formData.append("file", editFile);
    if (!editId) formData.append("file", file);

    const url = editId ? `${API_URL}/${editId}` : `${API_URL}/upload`;
    const method = editId ? "PUT" : "POST";

    try {
      const res = await fetch(url, {
        method,
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      });
      const data = await res.json();

      if (!res.ok) throw new Error(data.error || "Operation failed");

      toast.success(editId ? `✏️ "${title}" updated successfully!` : `✅ "${title}" uploaded successfully!`);
      setTitle("");
      setYear("");
      setFile(null);
      setEditFile(null);
      setEditId(null);
      fetchBooks();
    } catch (err) {
      toast.error("❌ " + err.message);
    }
  };

  // Start editing
  const startEdit = (book) => {
    setEditId(book.id);
    setTitle(book.title);
    setYear(book.year);
    setEditFile(null);
  };

  // Delete book
  const deleteBook = async (id) => {
    if (!window.confirm("Are you sure you want to delete this book?")) return;

    try {
      const res = await fetch(`${API_URL}/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();

      if (!res.ok) throw new Error(data.error || "Delete failed");

      toast.success("✅ Book deleted successfully!");
      fetchBooks();
    } catch (err) {
      toast.error("❌ " + err.message);
    }
  };

  // Download book
  const downloadBook = async (id) => {
    try {
      const res = await fetch(`${API_URL}/download/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!res.ok) throw new Error("Download failed");

      const disposition = res.headers.get("Content-Disposition");
      let filename = "book";
      if (disposition && disposition.includes("filename=")) {
        filename = disposition.split("filename=")[1].replace(/"/g, "");
      }

      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = filename;
      a.click();
      window.URL.revokeObjectURL(url);

      toast.success("📘 Download started!");
    } catch (err) {
      toast.error("❌ " + err.message);
    }
  };

  if (!token) return <p>Please log in to view books.</p>;

  return (
    <div className="books-container">
      <h2>📚 Manage Books</h2>
      <ToastContainer position="top-right" autoClose={3000} />

      {["AUTHOR", "ADMIN"].includes(loggedInRole) && (
        <form className="books-form" onSubmit={handleSubmit}>
          <input type="text" placeholder="Book Title" value={title} onChange={(e) => setTitle(e.target.value)} required />
          <input type="number" placeholder="Published Year" value={year} onChange={(e) => setYear(e.target.value)} required />
          <input type="file" accept=".pdf,.doc,.docx" onChange={(e) => editId ? setEditFile(e.target.files[0]) : setFile(e.target.files[0])} />
          <button type="submit">{editId ? "✏️ Update Book" : "📤 Upload Book"}</button>
          {editId && <button type="button" onClick={() => { setEditId(null); setTitle(""); setYear(""); setEditFile(null); }}>❌ Cancel</button>}
        </form>
      )}

      {loading ? (
        <p>Loading books...</p>
      ) : (
        <table className="books-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>📖 Title</th>
              <th>✍️ Author</th>
              <th>📅 Year</th>
              <th>⚡ Actions</th>
            </tr>
          </thead>
          <tbody>
            {books.length > 0 ? books.map(book => (
              <tr key={book.id}>
                <td>{book.id}</td>
                <td>{book.title}</td>
                <td>{book.author}</td>
                <td>{book.year}</td>
                <td>
                  <button onClick={() => downloadBook(book.id)}>⬇️ Download</button>
                  {(loggedInRole === "ADMIN" || (loggedInRole === "AUTHOR" && loggedInUser === book.author)) && (
                    <>
                      <button onClick={() => startEdit(book)}>✏️ Edit</button>
                      {loggedInRole === "ADMIN" && <button onClick={() => deleteBook(book.id)}>🗑️ Delete</button>}
                    </>
                  )}
                </td>
              </tr>
            )) : <tr><td colSpan="5">No books available</td></tr>}
          </tbody>
        </table>
      )}
    </div>
  );
}

export default Books;
