import React, { useEffect, useState } from "react";
import Chart from "react-apexcharts";
import classNames from "classnames";

const DATA_URL = "/mock/market-summary.json";

/**
 * MarketTrends
 * - Fully data-driven from JSON
 * - Hover / click tracking → CDP
 * - ApexCharts with datetime tooltip
 */
export default function MarketTrends() {
  const [data, setData] = useState(null);
  const [error, setError] = useState(null);

  /* ================================
   * Load data
   * ================================ */
  useEffect(() => {
    fetch(DATA_URL)
      .then((res) => {
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        return res.json();
      })
      .then(setData)
      .catch((err) => setError(err.message));
  }, []);

  if (error) {
    return <div className="alert alert-danger">{error}</div>;
  }

  if (!data) {
    return (
      <div className="text-center text-muted my-5">
        <div className="spinner-border mb-2" />
        <div>Loading market summary…</div>
      </div>
    );
  }

  /* ================================
   * Helpers
   * ================================ */
  const trackFocus = (metric) => {
    if (window.LeoObserver) {
      window.LeoObserver.recordEventFocusIndexMetric({
        indexMetric: metric,
      });
    }
  };

  const buildSeries = (series) => ({
    series: [
      {
        data: series.map((p) => ({
          x: new Date(p.time).getTime(),
          y: p.value,
        })),
      },
    ],
  });

  const buildOptions = (color, metricName) => ({
    chart: {
      type: "area",
      toolbar: { show: false },
      zoom: { enabled: false },
      events: {
        mouseMove: () => trackFocus(metricName),
        click: () => trackFocus(metricName),
      },
    },
    stroke: { curve: "smooth", width: 2 },
    fill: {
      type: "gradient",
      gradient: {
        shade: "light",
        type: "vertical",
        shadeIntensity: 0.75,
        inverseColors: false,
        opacityFrom: 0.55,
        opacityTo: 0.05,
        stops: [0, 85, 100],
      },
    },
    colors: [color],
    dataLabels: { enabled: false },
    xaxis: {
      type: "datetime",
      labels: { datetimeUTC: false },
    },
    tooltip: {
      x: {
        format: "dd MMM yyyy HH:mm",
      },
      y: {
        formatter: (val) => val.toLocaleString(),
      },
    },
    grid: { show: false },
  });

  /* ================================
   * Render
   * ================================ */
  return (
    <div className="container my-4">
      <h3 className="fw-bold mb-3">Market summary</h3>

      <div className="row g-4">
        {/* Main index */}
        <div className="col-lg-8">
          <div
            className="card shadow-sm"
            onMouseEnter={() => trackFocus(data.mainIndex.name)}
            onClick={() => trackFocus(data.mainIndex.name)}
          >
            <div className="card-body">
              <strong>
                {data.mainIndex.name} ({data.mainIndex.symbol})
              </strong>

              <div className="d-flex align-items-baseline my-2">
                <h2 className="fw-bold me-3">
                  {data.mainIndex.value.toLocaleString()}
                </h2>
                <span
                  className={classNames(
                    "fw-semibold",
                    data.mainIndex.changePercent >= 0
                      ? "text-success"
                      : "text-danger"
                  )}
                >
                  {data.mainIndex.changePercent}%
                </span>
              </div>

              <Chart
                type="area"
                {...buildSeries(data.mainIndex.series)}
                options={buildOptions(
                  data.mainIndex.color,
                  data.mainIndex.name
                )}
                height={280}
              />
            </div>
          </div>
        </div>

        {/* Major indices */}
        <div className="col-lg-4">
          <div className="card shadow-sm">
            <div className="card-body">
              <h6 className="fw-bold mb-3">Major indices</h6>

              {data.majorIndices.map((idx) => (
                <div
                  key={idx.name}
                  className="d-flex justify-content-between py-2 border-bottom"
                  onMouseEnter={() => trackFocus(idx.name)}
                  onClick={() => trackFocus(idx.name)}
                >
                  <div>{idx.name}</div>
                  <div className="text-end">
                    <div>{idx.value.toLocaleString()}</div>
                    <div
                      className={classNames(
                        "small",
                        idx.changePercent >= 0 ? "text-success" : "text-danger"
                      )}
                    >
                      {idx.changePercent}%
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Bottom metrics */}
      <div className="row g-4 mt-1">
        {data.bottomMetrics.map((m) => (
          <div className="col-md-4" key={m.name}>
            <div
              className="card shadow-sm"
              onMouseEnter={() => trackFocus(m.name)}
              onClick={() => trackFocus(m.name)}
            >
              <div className="card-body">
                <div className="fw-semibold">{m.name}</div>
                <div className="fw-bold">{m.value}</div>
                <div
                  className={classNames(
                    "small mb-2",
                    m.changePercent >= 0 ? "text-success" : "text-danger"
                  )}
                >
                  {m.changePercent}%
                </div>

                <Chart
                  type="area"
                  {...buildSeries(m.series)}
                  options={buildOptions(m.color, m.name)}
                  height={120}
                />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
