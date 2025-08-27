import React, { useEffect, useState } from "react";
import { StockTable } from "./components/StockTable";

export default function App() {
  const [stocks, setStocks] = useState([]);

  useEffect(() => {
    fetch("/mock/stocks.json")
      .then((res) => res.json())
      .then((data) => setStocks(data))
      .catch((err) => console.error("Error loading mock data:", err));
  }, []);

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <h1 className="text-3xl font-bold text-center mb-6">
        📈 Stock Trading Dashboard
      </h1>
      <StockTable stocks={stocks} />
    </div>
  );
}
