import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

export default function LoginScreen({ auth }) {
  const navigate = useNavigate();
  const [localUser, setLocalUser] = useState("");
  const [localPass, setLocalPass] = useState("");
  const [error, setError] = useState(null);

  // If already logged in, redirect immediately
  useEffect(() => {
    if (auth.isLoggedIn) {
      navigate("/home", { replace: true });
    }
  }, [auth.isLoggedIn, navigate]);

  const handleSubmit = (e) => {
    e.preventDefault();
    setError(null);
    
    // We pass the local state values to the auth.login function
    // Note: We need to adapt the auth hook slightly or pass these values directly
    const success = auth.login(localUser, localPass);
    
    if (success) {
      navigate("/home", { replace: true });
    } else {
      setError("Invalid username or password. Please try again.");
    }
  };

  return (
    <div className="d-flex align-items-center justify-content-center min-vh-100 bg-light">
      <div className="card shadow-lg border-0" style={{ maxWidth: "400px", width: "100%" }}>
        <div className="card-body p-5">
          
          {/* Logo / Header Area */}
          <div className="text-center mb-4">
            <div className="bg-primary text-white rounded-circle d-inline-flex align-items-center justify-content-center mb-3" style={{ width: "60px", height: "60px", fontSize: "24px" }}>
              📈
            </div>
            <h3 className="fw-bold text-dark">Welcome Back</h3>
            <p className="text-muted small">Sign in to your trading dashboard</p>
          </div>

          {/* Error Message Alert */}
          {error && (
            <div className="alert alert-danger py-2 text-center small" role="alert">
              {error}
            </div>
          )}

          {/* Login Form */}
          <form onSubmit={handleSubmit}>
            <div className="form-floating mb-3">
              <input
                type="text"
                className="form-control"
                id="usernameInput"
                placeholder="Username"
                value={localUser}
                onChange={(e) => setLocalUser(e.target.value)}
                required
              />
              <label htmlFor="usernameInput" className="text-muted">Username</label>
            </div>
            
            <div className="form-floating mb-4">
              <input
                type="password"
                className="form-control"
                id="passwordInput"
                placeholder="Password"
                value={localPass}
                onChange={(e) => setLocalPass(e.target.value)}
                required
              />
              <label htmlFor="passwordInput" className="text-muted">Password</label>
            </div>

            <button type="submit" className="btn btn-primary w-100 btn-lg fw-bold mb-3">
              Sign In
            </button>
            
            <div className="text-center">
              <a href="#" className="text-decoration-none text-muted small">Forgot password?</a>
            </div>
          </form>
        </div>
        
        {/* Footer Area */}
        <div className="card-footer bg-white border-0 py-3 text-center">
           <small className="text-muted">Don't have an account? <a href="#" className="fw-bold text-primary text-decoration-none">Sign up</a></small>
        </div>
      </div>
    </div>
  );
}