import React, { useEffect, useState } from "react";
import useToast from "../utils/UseToast";

const DATA_URL = "/mock/book-review.json";

/**
 * 
 * 
 * BookReviews
 * - Load books via AJAX (fetch)
 * - Toggle "Want to Read" → Reading List
 * - Persist to localStorage
 * - Emit toast + observer events
 * - 📊 Reading List → Signal → Recommendation → Activation
 *
 */
export default function BookReviews() {
  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const { toasts, addToast, removeToast } = useToast();

  /* ================================
   * Reading List (localStorage)
   * ================================ */
  const [readingList, setReadingList] = useState(() => {
    if (typeof window === "undefined") return [];
    const saved = localStorage.getItem("reading_list");
    return saved ? JSON.parse(saved) : [];
  });

  useEffect(() => {
    localStorage.setItem("reading_list", JSON.stringify(readingList));
  }, [readingList]);

  const isInReadingList = (bookId) =>
    readingList.some((b) => b.id === bookId);

  const toggleReadingList = (book) => {
    if (isInReadingList(book.id)) {
      setReadingList((prev) =>
        prev.filter((b) => b.id !== book.id)
      );

      if (window.LeoObserver) {
        window.LeoObserver.recordEventRemoveReadingList({
          bookId: book.id,
          title: book.title
        });
      }

      addToast(
        `Removed "${book.title}" from Reading List`,
        "secondary",
        "bi-bookmark"
      );
    } else {
      setReadingList((prev) => [...prev, book]);

      if (window.LeoObserver) {
        window.LeoObserver.recordEventAddReadingList({
          bookId: book.id,
          title: book.title
        });
      }

      addToast(
        `Added "${book.title}" to Reading List`,
        "success",
        "bi-bookmark-fill"
      );
    }
  };

  /* ================================
   * Load books (AJAX)
   * ================================ */
  useEffect(() => {
    let mounted = true;

    async function loadBooks() {
      try {
        const res = await fetch(DATA_URL, {
          method: "GET",
          headers: { Accept: "application/json" }
        });

        if (!res.ok) {
          throw new Error(`HTTP ${res.status}`);
        }

        const data = await res.json();
        if (!Array.isArray(data)) {
          throw new Error("Invalid response format");
        }

        if (mounted) setBooks(data);
      } catch (err) {
        if (mounted) setError(err.message);
      } finally {
        if (mounted) setLoading(false);
      }
    }

    loadBooks();
    return () => {
      mounted = false;
    };
  }, []);

  /* ================================
   * UI States
   * ================================ */
  if (loading) {
    return (
      <div className="container my-5 text-center text-muted">
        <div className="spinner-border mb-3" />
        <div>Loading book reviews…</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container my-5">
        <div className="alert alert-danger">
          Failed to load book reviews: {error}
        </div>
      </div>
    );
  }

  /* ================================
   * Render
   * ================================ */
  return (
    <div className="container my-5">
      <h3 className="fw-bold mb-1">
        Most Popular Investing Books
      </h3>
      <p className="text-muted mb-4">
        Books frequently added by investors and stock traders
      </p>

      <div className="list-group list-group-flush">
        {books.map((book, index) => {
          const inList = isInReadingList(book.id);

          return (
            <div
              key={book.id}
              className="list-group-item py-4 border-bottom"
            >
              <div className="row g-3 align-items-start">
                {/* Rank */}
                <div className="col-auto">
                  <span className="fs-4 fw-bold text-muted">
                    #{index + 1}
                  </span>
                </div>

                {/* Cover */}
                <div className="col-auto">
                  <img
                    src={book.coverUrl}
                    alt={book.title}
                    className="rounded shadow-sm"
                    style={{
                      width: 80,
                      height: 120,
                      objectFit: "cover"
                    }}
                  />
                </div>

                {/* Content */}
                <div className="col">
                  <h5 className="fw-bold mb-1">
                    {book.title}
                  </h5>
                  <div className="text-muted mb-2">
                    {book.author}
                  </div>

                  <div className="d-flex align-items-center mb-2">
                    <i className="bi bi-star-fill text-warning me-1" />
                    <span className="fw-semibold me-2">
                      {book.rating}
                    </span>
                    <span className="text-muted small">
                      {book.ratingsCount.toLocaleString()} ratings ·{" "}
                      {Math.floor(book.shelvings / 1_000_000)}m shelvings
                    </span>
                  </div>

                  <p className="mb-3">
                    {book.description}
                  </p>

                  <button
                    className={`btn btn-sm ${
                      inList
                        ? "btn-outline-success"
                        : "btn-success"
                    }`}
                    onClick={() => toggleReadingList(book)}
                  >
                    <i
                      className={`bi ${
                        inList
                          ? "bi-bookmark-fill"
                          : "bi-bookmark"
                      } me-2`}
                    />
                    {inList
                      ? "In Reading List"
                      : "Want to Read"}
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Toasts */}
      <div className="toast-container position-fixed bottom-0 end-0 p-3">
        {toasts.map((t) => (
          <div
            key={t.id}
            className={`toast show text-bg-${t.type} mb-2`}
          >
            <div className="toast-body d-flex align-items-center">
              <i className={`bi ${t.icon} me-2`} />
              <span>{t.message}</span>
              <button
                className="btn-close btn-close-white ms-auto"
                onClick={() => removeToast(t.id)}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
