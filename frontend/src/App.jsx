import React, { useState, useEffect } from "react";
import { BrowserRouter as Router, Routes, Route, Link } from "react-router-dom";
import Authors from "./Authors";
import Subjects from "./Subjects";
import Books from "./Books";
import "./App.css";

function App() {
  const [isLoginOpen, setIsLoginOpen] = useState(false);
  const [isSignupOpen, setIsSignupOpen] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  // Login state
  const [loginUser, setLoginUser] = useState("");
  const [loginPass, setLoginPass] = useState("");
  const [loginError, setLoginError] = useState("");

  // Signup state
  const [signupName, setSignupName] = useState("");
  const [signupEmail, setSignupEmail] = useState("");
  const [signupPass, setSignupPass] = useState("");
  const [signupConfirm, setSignupConfirm] = useState("");
  const [signupRole, setSignupRole] = useState("STUDENT"); // ✅ default role
  const [signupError, setSignupError] = useState("");

  // ✅ Check localStorage on first render
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) setIsLoggedIn(true);
  }, []);

  // ✅ Logout
  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("role");
    setIsLoggedIn(false);
    alert("👋 Logged out successfully");
  };

  // ✅ Login
  const handleLogin = async (e) => {
    e.preventDefault();
    if (!loginUser || !loginPass) {
      setLoginError("Please enter both username and password.");
      return;
    }

    try {
      const response = await fetch("http://localhost:8081/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username: loginUser, password: loginPass }),
      });

      const data = await response.json();
      if (!response.ok || !data.token) {
        throw new Error(data.error || "Invalid credentials");
      }

      // ✅ Save token + role
      localStorage.setItem("token", data.token);
      localStorage.setItem("role", data.role);

      setIsLoggedIn(true);
      setIsLoginOpen(false);
      setLoginError("");
      alert(`✅ Logged in successfully as ${loginUser} (${data.role})`);
    } catch (err) {
      setLoginError("❌ " + err.message);
    }
  };

  // ✅ Signup (auto login)
  const handleSignup = async (e) => {
    e.preventDefault();

    if (!signupName || !signupEmail || !signupPass || !signupConfirm) {
      setSignupError("All fields are required.");
      return;
    }
    if (signupPass !== signupConfirm) {
      setSignupError("Passwords do not match.");
      return;
    }

    try {
      const response = await fetch("http://localhost:8081/auth/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          username: signupName,
          email: signupEmail,
          password: signupPass,
          role: signupRole, // ✅ include role
        }),
      });

      const data = await response.json();
      if (!response.ok || !data.token) {
        throw new Error(data.error || "Signup failed");
      }

      // ✅ Save token + role
      localStorage.setItem("token", data.token);
      localStorage.setItem("role", data.role);

      setIsLoggedIn(true);
      setIsSignupOpen(false);
      setSignupError("");
      alert(`✅ Account created as ${signupRole} (${signupName})`);
    } catch (err) {
      setSignupError("❌ " + err.message);
    }
  };

  return (
    <Router>
      {/* ✅ Navbar */}
      <nav className="navbar">
        <div className="logo">Online Library</div>
        <div className="nav-links">
          <Link to="/">Home</Link>
          <Link to="/books">Books</Link>
          <Link to="/authors">Authors</Link>
          <Link to="/subjects">Subjects</Link>

          {!isLoggedIn ? (
            <>
              <button className="login-btn" onClick={() => setIsLoginOpen(true)}>
                Login
              </button>
              <button
                className="signup-btn"
                onClick={() => setIsSignupOpen(true)}
              >
                Sign Up
              </button>
            </>
          ) : (
            <button className="logout-btn" onClick={handleLogout}>
              Logout
            </button>
          )}
        </div>
      </nav>

      {/* ✅ Routes */}
      <Routes>
        <Route
          path="/"
          element={
            <section className="hero">
              <h1>Welcome to the Online Library</h1>
              <p>Explore thousands of books, authors, and subjects.</p>
            </section>
          }
        />
        <Route path="/books" element={<Books />} />
        <Route path="/authors" element={<Authors />} />
        <Route path="/subjects" element={<Subjects />} />
      </Routes>

      {/* ✅ Signup Modal */}
      {isSignupOpen && (
        <div className="modal-overlay">
          <div className="modal">
            <button className="close-btn" onClick={() => setIsSignupOpen(false)}>
              ✕
            </button>
            <h2>Create an Account</h2>
            <form onSubmit={handleSignup}>
              <label>Username</label>
              <input
                type="text"
                value={signupName}
                onChange={(e) => setSignupName(e.target.value)}
                placeholder="Enter username"
              />

              <label>Email</label>
              <input
                type="email"
                value={signupEmail}
                onChange={(e) => setSignupEmail(e.target.value)}
                placeholder="Enter email"
              />

              <label>Password</label>
              <input
                type="password"
                value={signupPass}
                onChange={(e) => setSignupPass(e.target.value)}
                placeholder="Enter password"
              />

              <label>Confirm Password</label>
              <input
                type="password"
                value={signupConfirm}
                onChange={(e) => setSignupConfirm(e.target.value)}
                placeholder="Re-enter password"
              />

              {/* ✅ Role Dropdown */}
              <label>Role</label>
              <select
                value={signupRole}
                onChange={(e) => setSignupRole(e.target.value)}
              >
                <option value="STUDENT">Student</option>
                <option value="AUTHOR">Author</option>
                <option value="ADMIN">Admin</option>
              </select>

              {signupError && <p className="error">{signupError}</p>}
              <button type="submit" className="submit-btn">
                Sign Up
              </button>
            </form>
          </div>
        </div>
      )}

      {/* ✅ Login Modal */}
      {isLoginOpen && (
        <div className="modal-overlay">
          <div className="modal">
            <button className="close-btn" onClick={() => setIsLoginOpen(false)}>
              ✕
            </button>
            <h2>Library Login</h2>
            <form onSubmit={handleLogin}>
              <label>Username</label>
              <input
                type="text"
                value={loginUser}
                onChange={(e) => setLoginUser(e.target.value)}
                placeholder="Enter username"
              />
              <label>Password</label>
              <input
                type="password"
                value={loginPass}
                onChange={(e) => setLoginPass(e.target.value)}
                placeholder="Enter password"
              />
              {loginError && <p className="error">{loginError}</p>}
              <button type="submit" className="submit-btn">
                Login
              </button>
            </form>
          </div>
        </div>
      )}
    </Router>
  );
}

export default App;
