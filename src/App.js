import React, { useEffect, useState } from "react";
import { StockTable } from "./components/StockTable";

export default function App() {
  const LOGIN_KEY_NAME = "isLoggedIn";

  const [configs, setConfigs] = useState(null);
  const [loggedIn, setLoggedIn] = useState(
    () => localStorage.getItem(LOGIN_KEY_NAME) === "true"
  );
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [stocks, setStocks] = useState([]);

  // Load configs from window.DEFAULT_CONFIGS on mount
  useEffect(() => {    
    if (typeof window !== "undefined" && window.DEFAULT_CONFIGS) {
      setConfigs(window.DEFAULT_CONFIGS);
      setUsername(window.DEFAULT_CONFIGS.TEST_USER_NAME || "");
      setPassword(window.DEFAULT_CONFIGS.TEST_USER_PASSWORD || "");
    }
  }, []);

  // Fetch stocks when configs are available
  useEffect(() => {
    if (configs?.DATA_SOURCE_URL) {
      fetch(configs.DATA_SOURCE_URL)
        .then((res) => res.json())
        .then((data) => setStocks(data))
        .catch((err) => console.error("Error loading mock data:", err));
    }
  }, [configs]);

  // Check login state
  useEffect(() => {
    const savedLoginState = localStorage.getItem(LOGIN_KEY_NAME);
    if (savedLoginState === "true") {
      setLoggedIn(true);
    }
  }, []);

  const handleLogin = (e) => {
    e.preventDefault();
    if (
      username === configs.TEST_USER_NAME &&
      password === configs.TEST_USER_PASSWORD
    ) {
      setLoggedIn(true);
      localStorage.setItem(LOGIN_KEY_NAME, "true");
    } else {
      alert("Invalid credentials");
    }
  };

  const handleLogout = () => {
    setLoggedIn(false);
    setUsername("");
    setPassword("");
    localStorage.removeItem(LOGIN_KEY_NAME);
  };

  // The Login form is now a clean, centered Bootstrap Card
  if (!loggedIn) {
    return (
      <div className="container mt-5">
        <div className="row justify-content-center">
          <div className="col-md-5 col-lg-4">
            <div className="card shadow-sm border-0">
              <div className="card-body p-4">
                <h2 className="card-title text-center mb-4 fs-4">Login</h2>
                <form onSubmit={handleLogin} autoComplete="off" >
                  <div className="form-floating mb-3">
                    <input
                      type="text"
                      className="form-control"
                      id="usernameInput"
                      placeholder="Username"
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      autoComplete="off"
                    />
                    <label htmlFor="usernameInput">Username</label>
                  </div>
                  <div className="form-floating mb-3">
                    <input
                      type="password"
                      className="form-control"
                      id="passwordInput"
                      placeholder="Password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      autoComplete="off"
                    />
                    <label htmlFor="passwordInput">Password</label>
                  </div>
                  <div className="d-grid">
                    <button type="submit" className="btn btn-primary btn-lg">
                      Login
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">📈 Stock Trading Dashboard</h1>
        <button onClick={handleLogout} className="btn btn-danger">
          Logout
        </button>
      </div>
      <StockTable stocks={stocks} />
    </div>
  );
}
