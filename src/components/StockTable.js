import React, { useState, useEffect, useCallback } from "react";

// ==========================================
// 1. TOAST NOTIFICATION SYSTEM
// ==========================================

const ToastContainer = ({ toasts, removeToast }) => {
  return (
    <div
      className="toast-container position-fixed bottom-0 end-0 p-3"
      style={{ zIndex: 1050 }}
    >
      {toasts.map((toast) => (
        <div
          key={toast.id}
          className={`toast show align-items-center text-white bg-${toast.type} border-0 mb-2`}
          role="alert"
          aria-live="assertive"
          aria-atomic="true"
          style={{ animation: "slideIn 0.3s ease-out" }}
        >
          <div className="d-flex">
            <div className="toast-body fs-6">
              <i className={`bi ${toast.icon} me-2`}></i>
              {toast.message}
            </div>
            <button
              type="button"
              className="btn-close btn-close-white me-2 m-auto"
              onClick={() => removeToast(toast.id)}
              aria-label="Close"
            ></button>
          </div>
        </div>
      ))}
      <style>
        {`
          @keyframes slideIn {
            from { transform: translateX(100%); opacity: 0; }
            to { transform: translateX(0); opacity: 1; }
          }
        `}
      </style>
    </div>
  );
};

// ==========================================
// 2. CUSTOM HOOKS (Logic Layer)
// ==========================================

const useToast = () => {
  const [toasts, setToasts] = useState([]);

  const addToast = useCallback((message, type = "primary", icon = "bi-info-circle") => {
    const id = Date.now();
    setToasts((prev) => [...prev, { id, message, type, icon }]);

    // Auto-dismiss after 3 seconds
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 3000);
  }, []);

  const removeToast = (id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  return { toasts, addToast, removeToast };
};

const usePortfolio = (addToast) => {
  const [portfolio, setPortfolio] = useState(() => {
    if (typeof window === "undefined") return [];
    const saved = localStorage.getItem("portfolio");
    return saved ? JSON.parse(saved) : [];
  });

  useEffect(() => {
    localStorage.setItem("portfolio", JSON.stringify(portfolio));
  }, [portfolio]);

  const tradeStock = (stock, action) => {
    setPortfolio((prev) => {
      const existing = prev.find((p) => p.symbol === stock.symbol);
      let newPortfolio = [...prev];

      if (existing) {
        newPortfolio = prev
          .map((p) =>
            p.symbol === stock.symbol
              ? { ...p, shares: p.shares + (action === "BUY" ? 1 : -1) }
              : p
          )
          .filter((p) => p.shares > 0);
      } else if (action === "BUY") {
        newPortfolio.push({ ...stock, shares: 1 });
      }
      return newPortfolio;
    });

    // Tracking & Notification
    if (action === "BUY") {
      if (window.LeoObserver) window.LeoObserver.recordEventBuyStock({ stockSymbol: stock.symbol });
      addToast(`Bought 1 share of ${stock.symbol}`, "success", "bi-bag-plus");
    } else {
      if (window.LeoObserver) window.LeoObserver.recordEventSellStock({ stockSymbol: stock.symbol });
      addToast(`Sold 1 share of ${stock.symbol}`, "danger", "bi-bag-dash");
    }
  };

  return { portfolio, tradeStock };
};

const useWatchlist = (addToast) => {
  const [watchlist, setWatchlist] = useState(() => {
    if (typeof window === "undefined") return [];
    const saved = localStorage.getItem("watchlist");
    return saved ? JSON.parse(saved) : [];
  });

  useEffect(() => {
    localStorage.setItem("watchlist", JSON.stringify(watchlist));
  }, [watchlist]);

  const isInWatchlist = (symbol) => watchlist.some((s) => s.symbol === symbol);

  const toggleWatchlist = (stock) => {
    if (isInWatchlist(stock.symbol)) {
      setWatchlist((prev) => prev.filter((s) => s.symbol !== stock.symbol));
      if (window.LeoObserver) window.LeoObserver.recordEventRemoveWatchlist({ stockSymbol: stock.symbol });
      addToast(`Removed ${stock.symbol} from Watchlist`, "secondary", "bi-star");
    } else {
      setWatchlist((prev) => [...prev, stock]);
      if (window.LeoObserver) window.LeoObserver.recordEventAddWatchlist({ stockSymbol: stock.symbol });
      addToast(`Added ${stock.symbol} to Watchlist`, "warning", "bi-star-fill");
    }
  };

  return { watchlist, isInWatchlist, toggleWatchlist };
};

// ==========================================
// 3. SUB-COMPONENTS (Presentation Layer)
// ==========================================

const MarketRow = ({ stock, onSelectStock, onTrade, onToggleWatch, isWatching, onReport }) => {
  const isPositive = stock.change >= 0;

  return (
    <tr
      style={{ cursor: "pointer" }}
      onClick={() => onSelectStock(stock)}
      className="align-middle"
    >
      <td className="fw-bold text-primary">{stock.symbol}</td>
      <td>{stock.name}</td>
      <td className="text-end fw-bold">${stock.price.toFixed(2)}</td>
      <td className={`text-end fw-semibold ${isPositive ? "text-success" : "text-danger"}`}>
        <i className={`bi ${isPositive ? "bi-arrow-up" : "bi-arrow-down"} me-1`} />
        {Math.abs(stock.change).toFixed(2)}
      </td>
      <td className="text-center" onClick={(e) => e.stopPropagation()}>
        <div className="btn-group btn-group-sm shadow-sm">
          <button className="btn btn-success" onClick={() => onTrade(stock, "BUY")} title="Buy Stock">
            <i className="bi bi-plus-lg" /> Buy
          </button>
          <button className="btn btn-danger" onClick={() => onTrade(stock, "SELL")} title="Sell Stock">
            <i className="bi bi-dash-lg" /> Sell
          </button>
          <button 
            className={`btn ${isWatching ? "btn-warning text-white" : "btn-outline-secondary"}`} 
            onClick={() => onToggleWatch(stock)}
            title="Toggle Watchlist"
          >
            <i className={`bi ${isWatching ? "bi-star-fill" : "bi-star"}`} />
          </button>
          <button className="btn btn-dark" onClick={() => onReport(stock)} title="View Report">
            <i className="bi bi-file-bar-graph" />
          </button>
        </div>
      </td>
    </tr>
  );
};

const PortfolioSection = ({ portfolio }) => (
  <div className="card shadow-sm h-100 border-0">
    <div className="card-header bg-white border-bottom-0 pt-3">
      <h5 className="mb-0 text-primary"><i className="bi bi-wallet2 me-2"></i>My Portfolio</h5>
    </div>
    <div className="card-body p-0">
      {portfolio.length === 0 ? (
        <div className="p-4 text-center text-muted bg-light m-3 rounded">
          <i className="bi bi-inbox fs-4 d-block mb-2"></i>
          Your portfolio is empty.
        </div>
      ) : (
        <ul className="list-group list-group-flush">
          {portfolio.map((p) => (
            <li key={p.symbol} className="list-group-item d-flex justify-content-between align-items-center px-4 py-3">
              <div>
                <span className="fw-bold text-dark">{p.symbol}</span>
                <small className="text-muted d-block" style={{ fontSize: "0.8rem" }}>{p.name}</small>
              </div>
              <span className="badge bg-primary rounded-pill px-3 py-2">
                {p.shares} share{p.shares !== 1 && 's'}
              </span>
            </li>
          ))}
        </ul>
      )}
    </div>
  </div>
);

const WatchlistSection = ({ watchlist, onRemove }) => (
  <div className="card shadow-sm h-100 border-0">
    <div className="card-header bg-white border-bottom-0 pt-3">
      <h5 className="mb-0 text-warning"><i className="bi bi-stars me-2"></i>Watchlist</h5>
    </div>
    <div className="card-body p-0">
      {watchlist.length === 0 ? (
        <div className="p-4 text-center text-muted bg-light m-3 rounded">
          <i className="bi bi-eye-slash fs-4 d-block mb-2"></i>
          No stocks in watchlist.
        </div>
      ) : (
        <ul className="list-group list-group-flush">
          {watchlist.map((stock) => (
            <li key={stock.symbol} className="list-group-item d-flex justify-content-between align-items-center px-4 py-3">
              <div>
                <span className="fw-bold text-dark">{stock.symbol}</span>
                <small className="text-muted d-block" style={{ fontSize: "0.8rem" }}>{stock.name}</small>
              </div>
              <button 
                onClick={() => onRemove(stock)} 
                className="btn btn-sm btn-outline-danger border-0 rounded-circle"
                title="Remove"
              >
                <i className="bi bi-x-lg"></i>
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  </div>
);

// ==========================================
// 4. MAIN COMPONENT
// ==========================================

export const StockTable = ({ stocks, onSelectStock }) => {
  const { toasts, addToast, removeToast } = useToast();
  const { portfolio, tradeStock } = usePortfolio(addToast);
  const { watchlist, isInWatchlist, toggleWatchlist } = useWatchlist(addToast);

  const handleReportClick = (stock) => {
    onSelectStock(stock);
    addToast(`Generated report for ${stock.symbol}`, "info", "bi-graph-up-arrow");
  };

  return (
    <div className="container-fluid my-4">
      {/* Notifications */}
      <ToastContainer toasts={toasts} removeToast={removeToast} />

      {/* Main Table */}
      <div className="card shadow-sm mb-4 border-0">
        <div className="card-header bg-white py-3">
          <h2 className="h5 mb-0 fw-bold">📊 Market Overview</h2>
        </div>
        <div className="card-body p-0">
          <div className="table-responsive">
            <table className="table table-hover mb-0">
              <thead className="table-light">
                <tr>
                  <th className="ps-4">Symbol</th>
                  <th>Company</th>
                  <th className="text-end">Price</th>
                  <th className="text-end">Change</th>
                  <th className="text-center">Actions</th>
                </tr>
              </thead>
              <tbody>
                {stocks.map((stock) => (
                  <MarketRow
                    key={stock.symbol}
                    stock={stock}
                    onSelectStock={onSelectStock}
                    onTrade={tradeStock}
                    onToggleWatch={toggleWatchlist}
                    isWatching={isInWatchlist(stock.symbol)}
                    onReport={handleReportClick}
                  />
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Bottom Sections */}
      <div className="row g-4">
        <div className="col-lg-6">
          <PortfolioSection portfolio={portfolio} />
        </div>
        <div className="col-lg-6">
          <WatchlistSection watchlist={watchlist} onRemove={toggleWatchlist} />
        </div>
      </div>
    </div>
  );
};