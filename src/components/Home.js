import React, { useEffect, useState } from "react";
import Chart from "react-apexcharts"; // Requires: npm install react-apexcharts apexcharts

// ==========================================
// 1. POPUP MODAL COMPONENT
// ==========================================

const InfoModal = ({ show, onClose, data, type }) => {
  if (!show || !data) return null;

  // Determine title and subtitle based on type (News vs Trends)
  const title = type === "news" ? data.title : data.topic;
  const subtitle = type === "news" ? data.source : data.volume;

  return (
    <>
      {/* Backdrop */}
      <div 
        className="modal-backdrop fade show" 
        style={{ zIndex: 1040 }}
        onClick={onClose}
      ></div>
      
      {/* Modal Dialog */}
      <div className="modal fade show d-block" tabIndex="-1" role="dialog" style={{ zIndex: 1050 }}>
        <div className="modal-dialog modal-dialog-centered" role="document">
          <div className="modal-content shadow-lg border-0">
            <div className="modal-header bg-primary text-white">
              <h5 className="modal-title">
                {type === "news" ? "📰 News Detail" : "🔥 Trend Insight"}
              </h5>
              <button 
                type="button" 
                className="btn-close btn-close-white" 
                onClick={onClose} 
                aria-label="Close"
              ></button>
            </div>
            <div className="modal-body p-4">
              <h4 className="fw-bold mb-2">{title}</h4>
              <h6 className="text-muted mb-4 border-bottom pb-2">
                {subtitle} {type === "news" && `• ${data.time}`}
              </h6>
              
              <div className="fs-5 lh-base text-secondary">
                {data.content || "No details available for this item."}
              </div>
            </div>
            <div className="modal-footer border-0">
              <button type="button" className="btn btn-secondary" onClick={onClose}>
                Close
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

// ==========================================
// 2. MAIN COMPONENT
// ==========================================

export default function Home() {
  // ===== State for Data =====
  const [topStocks, setTopStocks] = useState([]);
  const [topNews, setTopNews] = useState([]);
  const [topTrends, setTopTrends] = useState([]);

  // ===== State for Modal =====
  const [modalData, setModalData] = useState(null);
  const [modalType, setModalType] = useState(null); // "news" or "trends"
  const [showModal, setShowModal] = useState(false);

  // ===== State for Chart (Hardcoded) =====
  const [assetData] = useState({
    series: [55000, 15000, 20000, 10000], 
    labels: ["Stocks", "Bonds", "Cash", "Crypto"],
  });
  const totalValue = assetData.series.reduce((a, b) => a + b, 0);

  const chartOptions = {
    chart: { type: "donut", fontFamily: "inherit" },
    labels: assetData.labels,
    colors: ["#0d6efd", "#ffc107", "#198754", "#dc3545"],
    plotOptions: {
      pie: {
        donut: {
          size: "70%",
          labels: {
            show: true,
            total: {
              show: true,
              label: "Total Assets",
              fontSize: "16px",
              fontWeight: 600,
              formatter: () => `$${totalValue.toLocaleString()}`,
            },
          },
        },
      },
    },
    dataLabels: { enabled: false },
    legend: { position: "bottom" },
    stroke: { show: false },
  };

  // ===== Fetch Data =====
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [stocksRes, newsRes, trendsRes] = await Promise.all([
          fetch("/mock/top-stocks.json"),
          fetch("/mock/top-news.json"),
          fetch("/mock/top-trends.json")
        ]);
        
        setTopStocks(await stocksRes.json());
        setTopNews(await newsRes.json());
        setTopTrends(await trendsRes.json());
      } catch (error) {
        console.error("Error loading dashboard data:", error);
      }
    };
    fetchData();
  }, []);

  // ===== Interaction Handler =====
  const handleItemClick = (item, type) => {
    setModalData(item);
    setModalType(type);
    setShowModal(true);

    // Track Event for CDP
    if (window.LeoObserver) {
      window.LeoObserver.recordEventContentView({ 
        id: item.id, 
        type: type, // "news" or "trends"
        [type === "news" ? "title" : "topic"]: type === "news" ? item.title : item.topic 
      });
      console.log(`CDP Event tracked: ContentView [${type}] ID: ${item.id}`);
    }
  };

  const closeModal = () => {
    setShowModal(false);
    setModalData(null);
  };

  // ===== Render =====
  return (
    <div className="container-fluid position-relative">
      
      {/* Modal Popup */}
      <InfoModal 
        show={showModal} 
        onClose={closeModal} 
        data={modalData} 
        type={modalType} 
      />

      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h2 className="fw-bold text-dark">My Dashboard</h2>
          <p className="text-muted mb-0">Welcome back, here is your daily overview.</p>
        </div>
        <div className="text-end">
          <button className="btn btn-primary btn-sm">
            <i className="bi bi-gear-fill me-1"></i> Customize
          </button>
        </div>
      </div>

      <div className="row g-4">
        
        {/* 1) Asset Chart */}
        <div className="col-md-6 col-lg-6">
          <div className="card shadow-sm h-100 border-0">
            <div className="card-header bg-white py-3">
              <h5 className="mb-0 fw-bold">💰 Asset Summary</h5>
            </div>
            <div className="card-body d-flex align-items-center justify-content-center">
              <div style={{ width: "100%", minHeight: "300px" }}>
                <Chart options={chartOptions} series={assetData.series} type="donut" height={320} />
              </div>
            </div>
          </div>
        </div>

        {/* 2) Top Stocks */}
        <div className="col-md-6 col-lg-6">
          <div className="card shadow-sm h-100 border-0">
            <div className="card-header bg-white py-3 d-flex justify-content-between align-items-center">
              <h5 className="mb-0 fw-bold">🚀 Top Movers</h5>
              <small className="text-muted">Real-time</small>
            </div>
            <div className="card-body p-0">
              <div className="table-responsive">
                <table className="table table-hover align-middle mb-0">
                  <thead className="table-light">
                    <tr>
                      <th className="ps-4">Symbol</th>
                      <th className="text-end">Price</th>
                      <th className="text-end pe-4">Change</th>
                    </tr>
                  </thead>
                  <tbody>
                    {topStocks.map((stock) => (
                      <tr key={stock.id}>
                        <td className="ps-4 fw-bold text-primary">{stock.symbol}</td>
                        <td className="text-end">${stock.price.toFixed(2)}</td>
                        <td className={`text-end pe-4 fw-semibold ${stock.change >= 0 ? "text-success" : "text-danger"}`}>
                          {stock.change > 0 ? "+" : ""}{stock.change}%
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>

        {/* 3) Breaking News (Clickable) */}
        <div className="col-md-6 col-lg-6">
          <div className="card shadow-sm h-100 border-0">
            <div className="card-header bg-white py-3">
              <h5 className="mb-0 fw-bold">📰 Breaking News</h5>
            </div>
            <div className="list-group list-group-flush">
              {topNews.map((item) => (
                <button 
                  key={item.id} 
                  className="list-group-item list-group-item-action px-4 py-3 border-bottom-0 text-start"
                  onClick={() => handleItemClick(item, "news")}
                >
                  <div className="d-flex w-100 justify-content-between">
                    <h6 className="mb-1 fw-bold text-dark">{item.title}</h6>
                    <small className="text-muted text-nowrap ms-2">{item.time}</small>
                  </div>
                  <small className="text-primary fw-medium">{item.source}</small>
                  <div className="mt-1 text-truncate text-muted small" style={{maxWidth: "90%"}}>
                    {item.content}
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* 4) Market Summary (Clickable) */}
        <div className="col-md-6 col-lg-6">
          <div className="card shadow-sm h-100 border-0">
            <div className="card-header bg-white py-3">
              <h5 className="mb-0 fw-bold">🔥 Market Summary</h5>
            </div>
            <div className="list-group list-group-flush">
              {topTrends.map((trend, index) => (
                <button 
                  key={trend.id} 
                  className="list-group-item list-group-item-action px-4 py-3 d-flex align-items-center text-start"
                  onClick={() => handleItemClick(trend, "trends")}
                >
                  <span className="badge bg-light text-dark me-3 border rounded-pill" style={{ width: "30px" }}>{index + 1}</span>
                  <div className="flex-grow-1">
                    <h6 className="mb-0 fw-bold text-dark">{trend.topic}</h6>
                    <small className="text-muted">{trend.volume} Volume</small>
                  </div>
                  <i className="bi bi-chevron-right text-muted"></i>
                </button>
              ))}
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}