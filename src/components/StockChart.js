import React from "react";
import Chart from "react-apexcharts";

export const StockChart = ({ stock }) => {
  if (!stock || !stock.dailyStats) {
    return (
      <div className="card shadow-sm mb-4">
        <div className="card-body text-muted text-center">
          Select a stock to view candlestick chart
        </div>
      </div>
    );
  }

  const series = [
    {
      name: stock.symbol,
      data: stock.dailyStats
    }
  ];

  const options = {
    chart: {
      type: "candlestick",
      height: 350,
      toolbar: { show: true }
    },
    title: {
      text: `${stock.name} (${stock.symbol})`,
      align: "left"
    },
    xaxis: {
      type: "category"
    },
    yaxis: {
      tooltip: { enabled: true }
    }
  };

  return (
    <div className="card shadow-sm mb-4">
      <div className="card-body">
        <Chart
          options={options}
          series={series}
          type="candlestick"
          height={350}
        />
      </div>
    </div>
  );
};
