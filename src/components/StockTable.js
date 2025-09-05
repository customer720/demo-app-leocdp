import React, { useState, useEffect } from "react";

// Add a comment to remind developers to include Bootstrap in their project
// Make sure to include Bootstrap 5 CSS and Icons in your project's public/index.html

export const StockTable = ({ stocks }) => {
  // Initialize state with localStorage data or empty array
  const [portfolio, setPortfolio] = useState(() => {
    const savedPortfolio = localStorage.getItem("portfolio");
    return savedPortfolio ? JSON.parse(savedPortfolio) : [];
  });
  const [watchlist, setWatchlist] = useState(() => {
    const savedWatchlist = localStorage.getItem("watchlist");
    return savedWatchlist ? JSON.parse(savedWatchlist) : [];
  });

  // Save portfolio to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem("portfolio", JSON.stringify(portfolio));
  }, [portfolio]);

  // Save watchlist to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem("watchlist", JSON.stringify(watchlist));
  }, [watchlist]);

  const handleTrade = (stock, action) => {
    setPortfolio((prev) => {
      const existing = prev.find((p) => p.symbol === stock.symbol);
      if (existing) {
        return prev.map((p) =>
            p.symbol === stock.symbol
              ? { ...p, shares: p.shares + (action === "BUY" ? 1 : -1) }
              : p
          )
          .filter((p) => p.shares > 0);
      } else if (action === "BUY") {
        
        return [...prev, { ...stock, shares: 1 }];
      }
      return prev;
    });

    if(action === "BUY"){
      LeoObserver.recordEventBuyStock({ stockSymbol: stock.symbol })
    }
    else {
      LeoObserver.recordEventSellStock({ stockSymbol: stock.symbol })
    }
  };

  const handleAddToWatchlist = (stockToAdd) => {
    if (!watchlist.some((stock) => stock.symbol === stockToAdd.symbol)) {
      setWatchlist((prev) => [...prev, stockToAdd]);
      LeoObserver.recordEventRemoveWatchlist({ stockSymbol: stockToAdd.symbol })
    }
  };

  const handleRemoveFromWatchlist = (stockSymbol) => {
    setWatchlist((prev) =>
      prev.filter((stock) => stock.symbol !== stockSymbol)
    );
    LeoObserver.recordEventRemoveWatchlist({ stockSymbol: stockSymbol })
  };

  const isInWatchlist = (stockSymbol) => {
    return watchlist.some((stock) => stock.symbol === stockSymbol);
  };

  // The main layout for the logged-in user
  return (
    <div className="container-fluid my-4">
      {/* Main Stock Table Card */}
      <div className="card shadow-sm mb-4">
        <div className="card-header">
          <h2 className="h5 mb-0">Market Overview</h2>
        </div>
        <div className="card-body">
          <div className="table-responsive">
            <table className="table table-hover align-middle mb-0">
              <thead className="table-light">
                <tr>
                  <th scope="col" className="p-3">
                    Symbol
                  </th>
                  <th scope="col" className="p-3">
                    Company
                  </th>
                  <th scope="col" className="p-3 text-end">
                    Price
                  </th>
                  <th scope="col" className="p-3 text-end">
                    Change
                  </th>
                  <th scope="col" className="p-3 text-center">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                {stocks.map((stock) => (
                  <tr key={stock.symbol}>
                    <td className="fw-bold">{stock.symbol}</td>
                    <td>{stock.name}</td>
                    <td className="text-end">${stock.price.toFixed(2)}</td>
                    <td
                      className={`text-end fw-semibold ${
                        stock.change >= 0 ? "text-success" : "text-danger"
                      }`}
                    >
                      {stock.change >= 0 ? (
                        <i className="bi bi-arrow-up"></i>
                      ) : (
                        <i className="bi bi-arrow-down"></i>
                      )}{" "}
                      {Math.abs(stock.change).toFixed(2)}
                    </td>
                    <td className="text-center">
                      <div className="btn-group" role="group">
                        <button
                          onClick={() => handleTrade(stock, "BUY")}
                          className="btn btn-sm btn-outline-success"
                        >
                          <i className="bi bi-bag-plus-fill me-1"></i>Buy
                        </button>
                        <button
                          onClick={() => handleTrade(stock, "SELL")}
                          className="btn btn-sm btn-outline-danger"
                        >
                          <i className="bi bi-bag-dash-fill me-1"></i>Sell
                        </button>
                        {isInWatchlist(stock.symbol) ? (
                          <button
                            onClick={() =>
                              handleRemoveFromWatchlist(stock.symbol)
                            }
                            className="btn btn-sm btn-outline-primary"
                          >
                            <i className="bi bi-star-fill me-1"></i>Watching
                          </button>
                        ) : (
                          <button
                            onClick={() => handleAddToWatchlist(stock)}
                            className="btn btn-sm btn-outline-secondary"
                          >
                            <i className="bi bi-star me-1"></i>Watch
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Portfolio and Watchlist Side-by-Side */}
      <div className="row g-4">
        <div className="col-lg-6">
          <div className="card shadow-sm h-100">
            <div className="card-header">
              <h2 className="h5 mb-0">My Portfolio</h2>
            </div>
            {portfolio.length === 0 ? (
              <div className="card-body text-center text-muted">
                <p className="mb-0">Your portfolio is empty.</p>
              </div>
            ) : (
              <ul className="list-group list-group-flush">
                {portfolio.map((p) => (
                  <li
                    key={p.symbol}
                    className="list-group-item d-flex justify-content-between align-items-center"
                  >
                    <div>
                      <span className="fw-bold">{p.symbol}</span>
                      <small className="text-muted d-block">{p.name}</small>
                    </div>
                    <span className="badge bg-primary rounded-pill">
                      {p.shares} shares
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
        <div className="col-lg-6">
          <div className="card shadow-sm h-100">
            <div className="card-header">
              <h2 className="h5 mb-0">My Watchlist</h2>
            </div>
            {watchlist.length === 0 ? (
              <div className="card-body text-center text-muted">
                <p className="mb-0">Your watchlist is empty.</p>
              </div>
            ) : (
              <ul className="list-group list-group-flush">
                {watchlist.map((stock) => (
                  <li
                    key={stock.symbol}
                    className="list-group-item d-flex justify-content-between align-items-center"
                  >
                    <div>
                      <span className="fw-bold">{stock.symbol}</span>
                      <small className="text-muted d-block">{stock.name}</small>
                    </div>
                    <button
                      onClick={() => handleRemoveFromWatchlist(stock.symbol)}
                      className="btn btn-sm btn-close"
                      aria-label="Remove from watchlist"
                    ></button>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
