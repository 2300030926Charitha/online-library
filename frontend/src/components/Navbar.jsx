import React from "react";
import { Link } from "react-router-dom";

function Navbar() {
  return (
    <nav className="navbar navbar-expand-lg navbar-dark bg-primary">
      <div className="container">
        <Link className="navbar-brand" to="/">Library Management System (LMS)</Link>
        <ul className="navbar-nav ms-auto">
          <li className="nav-item">
            <Link className="nav-link" to="/">Dashboard</Link>
          </li>
          <li className="nav-item">
            <Link className="nav-link" to="/books">Books</Link> {/* ✅ link to /Books */}
          </li>
          <li className="nav-item">
            <Link className="nav-link" to="/Authors">Authors</Link>
          </li>
          <li className="nav-item">
            <Link className="nav-link" to="/Subjects">Subjects</Link>
          </li>
        </ul>
      </div>
    </nav>
  );
}

export default Navbar;
