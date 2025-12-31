import { useState, useCallback } from "react";

/**
 * useToast
 * - Lightweight toast system
 * - Auto dismiss after 3s
 * - Bootstrap-compatible (type + icon)
 */
const useToast = () => {
  const [toasts, setToasts] = useState([]);

  const addToast = useCallback(
    (message, type = "primary", icon = "bi-info-circle") => {
      const id = Date.now();

      setToasts((prev) => [
        ...prev,
        { id, message, type, icon }
      ]);

      // Auto-dismiss after 3 seconds
      setTimeout(() => {
        setToasts((prev) => prev.filter((t) => t.id !== id));
      }, 3000);
    },
    []
  );

  const removeToast = (id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  return {
    toasts,
    addToast,
    removeToast
  };
};

export default useToast;
