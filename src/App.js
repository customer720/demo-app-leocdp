import React, { useEffect, useState } from "react";
import { StockTable } from "./components/StockTable";
import { StockChart } from "./components/StockChart";

export default function App() {
  const LOGIN_KEY_NAME = "isLoggedIn";

  const [configs, setConfigs] = useState(null);
  const [loggedIn, setLoggedIn] = useState(
    () => localStorage.getItem(LOGIN_KEY_NAME) === "true"
  );
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [stocks, setStocks] = useState([]);
  const [selectedStock, setSelectedStock] = useState(null);

  // ===== Load configs =====
  useEffect(() => {
    if (typeof window !== "undefined" && window.DEFAULT_CONFIGS) {
      setConfigs(window.DEFAULT_CONFIGS);
      setUsername(window.DEFAULT_CONFIGS.TEST_USER_NAME || "");
      setPassword(window.DEFAULT_CONFIGS.TEST_USER_PASSWORD || "");
    }
  }, []);

  // ===== Load stock data =====
  useEffect(() => {
    if (configs?.DATA_SOURCE_URL) {
      fetch(configs.DATA_SOURCE_URL)
        .then((res) => res.json())
        .then((data) => {
          setStocks(data);
          setSelectedStock(data[0] || null);
        })
        .catch((err) =>
          console.error("Error loading mock data:", err)
        );
    }
  }, [configs]);

  // ===== Restore login =====
  useEffect(() => {
    if (localStorage.getItem(LOGIN_KEY_NAME) === "true") {
      setLoggedIn(true);
    }
  }, []);

  // ===== Login =====
  const handleLogin = (e) => {
    e.preventDefault();
    if (
      username === configs.TEST_USER_NAME &&
      password === configs.TEST_USER_PASSWORD
    ) {
      const email = username + "@example.com";

      if (window.LeoObserverProxy) {
        LeoObserverProxy.recordActionEvent("login-success", {
          username,
          email
        });
      }

      setLoggedIn(true);
      localStorage.setItem(LOGIN_KEY_NAME, "true");
    } else {
      alert("Invalid credentials");
    }
  };

  // ===== Logout =====
  const handleLogout = () => {
    if (window.LeoObserver) {
      LeoObserver.recordEventUserLogout({ username });
    }
    setLoggedIn(false);
    setUsername("");
    setPassword("");
    localStorage.removeItem(LOGIN_KEY_NAME);
  };

  // ===== Stock report selection (IMPORTANT PART) =====
  const handleSelectStock = (stock) => {
    setSelectedStock(stock);

    if (window.LeoObserver && stock?.symbol) {
      LeoObserver.recordEventCheckStock({
        symbol: stock.symbol
      });
    }
  };

  // ===== Login screen =====
  if (!loggedIn) {
    return (
      <div className="container mt-5">
        <div className="row justify-content-center">
          <div className="col-md-5 col-lg-4">
            <div className="card shadow-sm border-0">
              <div className="card-body p-4">
                <h2 className="card-title text-center mb-4 fs-4">
                  Login
                </h2>
                <form onSubmit={handleLogin} autoComplete="off">
                  <div className="form-floating mb-3">
                    <input
                      type="text"
                      className="form-control"
                      id="usernameInput"
                      value={username}
                      onChange={(e) =>
                        setUsername(e.target.value)
                      }
                    />
                    <label htmlFor="usernameInput">
                      Username
                    </label>
                  </div>
                  <div className="form-floating mb-3">
                    <input
                      type="password"
                      className="form-control"
                      id="passwordInput"
                      value={password}
                      onChange={(e) =>
                        setPassword(e.target.value)
                      }
                    />
                    <label htmlFor="passwordInput">
                      Password
                    </label>
                  </div>
                  <button className="btn btn-primary w-100 btn-lg">
                    Login
                  </button>
                </form>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ===== Main app =====
  return (
    <div className="container-fluid p-4">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h1 className="fw-bold">
          📈 Stock Trading Dashboard – Demo CDP
        </h1>
        <button
          onClick={handleLogout}
          className="btn btn-danger"
        >
          Logout
        </button>
      </div>

      <StockChart stock={selectedStock} />

      <StockTable
        stocks={stocks}
        onSelectStock={handleSelectStock}
      />
    </div>
  );
}
