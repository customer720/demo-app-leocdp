import React, { useEffect, useState } from "react";
import { 
  BrowserRouter, 
  Routes, 
  Route, 
  NavLink, 
  Navigate, 
  Outlet, 
  useLocation 
} from "react-router-dom";

// === Component Imports ===
import LoginScreen from "./components/LoginScreen"; // <--- NEW IMPORT
import Home from "./components/Home";
import MarketTrends from "./components/MarketTrends";
import InvestingKnowledge from "./components/InvestingKnowledge";
import BookReviews from "./components/BookReviews";
import { StockTable } from "./components/StockTable";
import { StockChart } from "./components/StockChart";

// ==========================================
// 1. CONFIGURATION
// ==========================================

const LOGIN_KEY_NAME = "isLoggedIn";

const MENU_ITEMS = [
  { path: "/home", label: "My Home", icon: "🏠" },
  { path: "/market-trends", label: "Market Trends", icon: "📊" },
  { path: "/trading", label: "Trading Board", icon: "📈" },
  { path: "/knowledge", label: "Investing Courses", icon: "🎓" },
  { path: "/book-reviews", label: "Book Reviews", icon: "📚" },
];

// ==========================================
// 2. CUSTOM HOOKS
// ==========================================

const useAuth = (configs) => {
  const [isLoggedIn, setIsLoggedIn] = useState(
    () => typeof window !== "undefined" && localStorage.getItem(LOGIN_KEY_NAME) === "true"
  );
  
  // Note: We removed 'username' and 'password' state from here 
  // because the LoginScreen now handles its own input state.

  const login = (inputUser, inputPass) => {
    // Validate against configs
    if (inputUser === configs?.TEST_USER_NAME && inputPass === configs?.TEST_USER_PASSWORD) {
      localStorage.setItem(LOGIN_KEY_NAME, "true");
      setIsLoggedIn(true);
      
      // Analytics
      if (window.LeoObserverProxy) {
        window.LeoObserverProxy.recordActionEvent("login-success", { 
          username: inputUser, 
          email: inputUser + "@example.com" 
        });
      }
      return true;
    } 
    return false;
  };

  const logout = () => {
    localStorage.removeItem(LOGIN_KEY_NAME);
    setIsLoggedIn(false);
  };

  return { isLoggedIn, login, logout };
};

const useStockData = () => {
  const [configs, setConfigs] = useState(null);
  const [stocks, setStocks] = useState([]);
  const [selectedStock, setSelectedStock] = useState(null);

  useEffect(() => {
    if (typeof window !== "undefined" && window.DEFAULT_CONFIGS) {
      setConfigs(window.DEFAULT_CONFIGS);
    }
  }, []);

  useEffect(() => {
    if (configs?.DATA_SOURCE_URL) {
      fetch(configs.DATA_SOURCE_URL)
        .then((res) => res.json())
        .then((data) => {
          setStocks(data);
          setSelectedStock(data[0] || null);
        })
        .catch((err) => console.error("Error loading data:", err));
    }
  }, [configs]);

  return { configs, stocks, selectedStock, setSelectedStock };
};

// ==========================================
// 3. UI COMPONENTS (Layout)
// ==========================================

const Sidebar = ({ isCollapsed, toggleSidebar }) => {
  const sidebarStyle = {
    width: isCollapsed ? "80px" : "250px",
    minHeight: "100vh",
    transition: "all 0.3s ease",
    position: "fixed",
    left: 0,
    top: 0,
    zIndex: 1000,
    borderRight: "1px solid #dee2e6",
    backgroundColor: "#fff" // Changed to white for cleaner look
  };

  return (
    <div className="d-flex flex-column flex-shrink-0 p-3 shadow-sm" style={sidebarStyle}>
      <div className="d-flex align-items-center mb-4 text-decoration-none text-dark" style={{ height: "40px" }}>
        <button 
          className="btn btn-sm btn-light border me-2" 
          onClick={toggleSidebar}
        >
          {isCollapsed ? "☰" : "⬅"}
        </button>
        {!isCollapsed && <span className="fs-5 fw-bold text-primary"> FinTech Demo </span>}
      </div>
      
      <ul className="nav nav-pills flex-column mb-auto">
        {MENU_ITEMS.map((item) => (
          <li className="nav-item mb-2" key={item.path}>
            <NavLink 
              to={item.path}
              className={({ isActive }) => 
                `nav-link d-flex align-items-center ${isActive ? "active bg-primary text-white shadow-sm" : "link-dark"}`
              }
              title={isCollapsed ? item.label : ""}
            >
              <span className="fs-5 d-flex align-items-center justify-content-center" style={{ width: "24px" }}>{item.icon}</span>
              {!isCollapsed && <span className="ms-3 fw-medium">{item.label}</span>}
            </NavLink>
          </li>
        ))}
      </ul>
    </div>
  );
};

const ProtectedLayout = ({ auth, onLogout }) => {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const location = useLocation();

  if (!auth.isLoggedIn) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  const contentStyle = {
    marginLeft: isCollapsed ? "80px" : "250px",
    transition: "margin-left 0.3s ease",
    minHeight: "100vh",
    backgroundColor: "#f4f6f9", // Light grey background for content area
  };

  const currentItem = MENU_ITEMS.find(item => item.path === location.pathname);

  return (
    <>
      <Sidebar isCollapsed={isCollapsed} toggleSidebar={() => setIsCollapsed(!isCollapsed)} />
      
      <div style={contentStyle}>
        <div className="container-fluid p-4">
          {/* Top Header */}
          <div className="d-flex justify-content-between align-items-center mb-4 bg-white p-3 rounded shadow-sm">
            <h1 className="h4 m-0 fw-bold text-secondary">
              {currentItem ? currentItem.label : "Dashboard"}
            </h1>
            <button onClick={onLogout} className="btn btn-outline-danger btn-sm px-3">
              Logout
            </button>
          </div>
          
          {/* Main Content Card */}
          <div className="bg-white p-4 rounded shadow-sm" style={{ minHeight: "75vh" }}>
            <Outlet />
          </div>
        </div>
      </div>
    </>
  );
};

// ==========================================
// 4. MAIN APP
// ==========================================

export default function App() {
  const { configs, stocks, selectedStock, setSelectedStock } = useStockData();
  const auth = useAuth(configs);

  return (
    <BrowserRouter>
      <Routes>
        {/* Pass auth prop to the new LoginScreen component */}
        <Route path="/login" element={<LoginScreen auth={auth} />} />
        
        <Route element={<ProtectedLayout auth={auth} onLogout={auth.logout} />}>
          <Route path="/" element={<Navigate to="/home" replace />} />
          <Route path="/home" element={<Home />} />
          <Route path="/market-trends" element={<MarketTrends />} />
          <Route path="/trading" element={
            <>
              <div className="mb-4">
                <StockChart stock={selectedStock} />
              </div>
              <StockTable stocks={stocks} onSelectStock={setSelectedStock} />
            </>
          } />
          <Route path="/knowledge" element={<InvestingKnowledge />} />
          <Route path="/book-reviews" element={<BookReviews />} />
        </Route>

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}