import React, { useState } from "react";

export const StockTable = ({ stocks }) => {
  const [loggedIn, setLoggedIn] = useState(false);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [portfolio, setPortfolio] = useState([]);

  const handleLogin = (e) => {
    e.preventDefault();
    // Hard-coded login: user=test, pass=1234
    if (username === "test" && password === "1234") {
      setLoggedIn(true);
    } else {
      alert("Invalid credentials");
    }
  };

  const handleTrade = (stock, action) => {
    setPortfolio((prev) => {
      const existing = prev.find((p) => p.symbol === stock.symbol);
      if (existing) {
        return prev.map((p) =>
          p.symbol === stock.symbol
            ? { ...p, shares: p.shares + (action === "BUY" ? 1 : -1) }
            : p
        ).filter((p) => p.shares > 0);
      } else if (action === "BUY") {
        return [...prev, { ...stock, shares: 1 }];
      }
      return prev;
    });
  };

  if (!loggedIn) {
    return (
      <div className="max-w-sm mx-auto bg-white shadow-md rounded-xl p-6 mt-10">
        <h2 className="text-xl font-bold mb-4">Login</h2>
        <form onSubmit={handleLogin}>
          <input
            type="text"
            placeholder="Username"
            className="w-full border p-2 mb-3 rounded"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
          />
          <input
            type="password"
            placeholder="Password"
            className="w-full border p-2 mb-3 rounded"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          <button
            type="submit"
            className="bg-blue-600 text-white px-4 py-2 rounded w-full"
          >
            Login
          </button>
        </form>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="overflow-x-auto">
        <table className="min-w-full bg-white rounded-xl shadow-md">
          <thead>
            <tr className="bg-gray-200 text-gray-700">
              <th className="py-3 px-6 text-left">Symbol</th>
              <th className="py-3 px-6 text-left">Company</th>
              <th className="py-3 px-6 text-right">Price</th>
              <th className="py-3 px-6 text-right">Change</th>
              <th className="py-3 px-6 text-center">Actions</th>
            </tr>
          </thead>
          <tbody>
            {stocks.map((stock) => (
              <tr
                key={stock.symbol}
                className="border-b hover:bg-gray-50 transition"
              >
                <td className="py-3 px-6">{stock.symbol}</td>
                <td className="py-3 px-6">{stock.name}</td>
                <td className="py-3 px-6 text-right">${stock.price}</td>
                <td
                  className={`py-3 px-6 text-right font-semibold ${
                    stock.change >= 0 ? "text-green-600" : "text-red-600"
                  }`}
                >
                  {stock.change >= 0 ? "▲" : "▼"} {stock.change}
                </td>
                <td className="py-3 px-6 text-center space-x-2">
                  <button
                    onClick={() => handleTrade(stock, "BUY")}
                    className="bg-green-500 text-white px-3 py-1 rounded"
                  >
                    Buy
                  </button>
                  <button
                    onClick={() => handleTrade(stock, "SELL")}
                    className="bg-red-500 text-white px-3 py-1 rounded"
                  >
                    Sell
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="bg-white shadow-md rounded-xl p-6">
        <h2 className="text-lg font-bold mb-4">My Portfolio</h2>
        {portfolio.length === 0 ? (
          <p className="text-gray-500">No holdings yet.</p>
        ) : (
          <ul className="space-y-2">
            {portfolio.map((p) => (
              <li key={p.symbol} className="flex justify-between">
                <span>
                  {p.symbol} — {p.name}
                </span>
                <span>{p.shares} shares</span>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
};
