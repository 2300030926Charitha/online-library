import React, { useState, useEffect } from "react";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import "./Books.css";

function Books() {
  const [books, setBooks] = useState([]);
  const [title, setTitle] = useState("");
  const [author, setAuthor] = useState("");
  const [year, setYear] = useState("");

  // ✅ Fetch books from backend
  const fetchBooks = async () => {
    try {
      const response = await fetch("http://localhost:8081/api/books");
      if (!response.ok) throw new Error("Failed to fetch books");

      const data = await response.json();
      setBooks(data);
    } catch (err) {
      toast.error("❌ " + err.message);
    }
  };

  useEffect(() => {
    fetchBooks();
  }, []);

  // ✅ Add new book
  const addBook = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch("http://localhost:8081/api/books", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title, author, year }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to add book");
      }

      toast.success("✅ " + data.message);
      setTitle("");
      setAuthor("");
      setYear("");
      fetchBooks();
    } catch (err) {
      toast.error("❌ " + err.message);
    }
  };

  // ✅ Delete book
  const deleteBook = async (id) => {
    try {
      const response = await fetch(`http://localhost:8081/api/books/${id}`, {
        method: "DELETE",
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || "Failed to delete book");
      }

      toast.success("✅ " + data.message);
      fetchBooks();
    } catch (err) {
      toast.error("❌ " + err.message);
    }
  };

  return (
    <div className="books-container">
      <h2>📚 Manage Books</h2>

      {/* ✅ Toast container (must be inside component tree) */}
      <ToastContainer position="top-right" autoClose={3000} />

      {/* ✅ Add Book Form */}
      <form className="books-form" onSubmit={addBook}>
        <input
          type="text"
          placeholder="Book Title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          required
        />
        <input
          type="text"
          placeholder="Author Name"
          value={author}
          onChange={(e) => setAuthor(e.target.value)}
          required
        />
        <input
          type="number"
          placeholder="Published Year"
          value={year}
          onChange={(e) => setYear(e.target.value)}
          required
        />
        <button type="submit">➕ Add Book</button>
      </form>

      {/* ✅ Books Table */}
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
          {books.length > 0 ? (
            books.map((book) => (
              <tr key={book.id}>
                <td>{book.id}</td>
                <td>{book.title}</td>
                <td>{book.author}</td>
                <td>{book.year}</td>
                <td className="books-actions">
                  <button
                    className="delete-btn"
                    onClick={() => deleteBook(book.id)}
                  >
                    ❌ Delete
                  </button>
                </td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan="5">No books available</td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}

export default Books;
