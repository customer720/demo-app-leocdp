import React, { useEffect, useState } from "react";
import useToast from "../utils/UseToast";

const DATA_URL = "/mock/investing-courses.json";

/**
 * InvestingCourses
 * - AJAX load courses
 * - Course cover image
 * - Toggle "Want to Learn"
 * - localStorage persistence
 * - Toast + LeoObserver signals
 * - 🎯 Intent → Skill Gap → Course Recommendation → Activation flow
 */
export default function InvestingCourses() {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const { toasts, addToast, removeToast } = useToast();

  /* ================================
   * Learning List (localStorage)
   * ================================ */
  const [learningList, setLearningList] = useState(() => {
    if (typeof window === "undefined") return [];
    const saved = localStorage.getItem("learning_list");
    return saved ? JSON.parse(saved) : [];
  });

  useEffect(() => {
    localStorage.setItem(
      "learning_list",
      JSON.stringify(learningList)
    );
  }, [learningList]);

  const isInLearningList = (courseId) =>
    learningList.some((c) => c.id === courseId);

  const toggleLearningList = (course) => {
    if (isInLearningList(course.id)) {
      setLearningList((prev) =>
        prev.filter((c) => c.id !== course.id)
      );

      if (window.LeoObserver) {
        window.LeoObserver.recordEventRemoveLearningCourse({
          courseId: course.id,
          title: course.title
        });
      }

      addToast(
        `Removed "${course.title}" from Learning List`,
        "secondary",
        "bi-mortarboard"
      );
    } else {
      setLearningList((prev) => [...prev, course]);

      if (window.LeoObserver) {
        window.LeoObserver.recordEventAddLearningCourse({
          courseId: course.id,
          title: course.title
        });
      }

      addToast(
        `Added "${course.title}" to Learning List`,
        "info",
        "bi-mortarboard-fill"
      );
    }
  };

  /* ================================
   * Load courses (AJAX)
   * ================================ */
  useEffect(() => {
    let mounted = true;

    async function loadCourses() {
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

        if (mounted) setCourses(data);
      } catch (err) {
        if (mounted) setError(err.message);
      } finally {
        if (mounted) setLoading(false);
      }
    }

    loadCourses();
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
        <div>Loading investing courses…</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container my-5">
        <div className="alert alert-danger">
          Failed to load courses: {error}
        </div>
      </div>
    );
  }

  /* ================================
   * Render
   * ================================ */
  return (
    <div className="container my-5">
      <h3 className="fw-bold mb-1">Investing Courses</h3>
      <p className="text-muted mb-4">
        Structured learning paths for investors and traders
      </p>

      <div className="list-group list-group-flush">
        {courses.map((course) => {
          const inList = isInLearningList(course.id);

          return (
            <div
              key={course.id}
              className="list-group-item py-4 border-bottom"
            >
              <div className="row g-3 align-items-start">
                {/* Cover */}
                <div className="col-auto">
                  <img
                    src={course.coverUrl}
                    alt={course.title}
                    className="rounded shadow-sm"
                    style={{
                      width: 120,
                      height: 80,
                      objectFit: "cover"
                    }}
                  />
                </div>

                {/* Content */}
                <div className="col">
                  <h5 className="fw-bold mb-1">
                    {course.title}
                  </h5>

                  <div className="text-muted mb-2">
                    {course.provider} · {course.level}
                  </div>

                  <p className="mb-3">
                    {course.description}
                  </p>

                  <button
                    className={`btn btn-sm ${
                      inList
                        ? "btn-outline-info"
                        : "btn-info"
                    }`}
                    onClick={() =>
                      toggleLearningList(course)
                    }
                  >
                    <i
                      className={`bi ${
                        inList
                          ? "bi-mortarboard-fill"
                          : "bi-mortarboard"
                      } me-2`}
                    />
                    {inList
                      ? "In Learning List"
                      : "Want to Learn"}
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
