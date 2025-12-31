// CDP Tracking Script
/* ============================================================
 * (1) Parse UTM parameters
 * ============================================================ */
window.parseDataUTM =
  window.parseDataUTM ||
  function () {
    const params = new URLSearchParams(location.search);
    const utm = {};
    for (const [k, v] of params) {
      if (k.startsWith("utm_")) utm[k] = v;
    }
    return Object.keys(utm).length ? utm : undefined;
  };

/* ============================================================
 * (2) CDP Observer Setup
 * ============================================================ */
if (typeof window.LeoObserverProxy === "object") {
  const proxy = window.LeoObserverProxy;
  const LeoObserver = {};

  /* ----------------------------
   * Event factories
   * ---------------------------- */
  const view =
    (name) =>
    (data = {}) =>
      proxy.recordViewEvent(name, data);

  const action =
    (name) =>
    (data = {}) =>
      proxy.recordActionEvent(name, data);

  /* ----------------------------
   * View Events
   * ---------------------------- */
  LeoObserver.recordEventPageView = view("page-view");
  LeoObserver.recordEventContentView = view("content-view");
  LeoObserver.recordEventStockView = view("stock-view");

  /* ----------------------------
   * Action Events
   * ---------------------------- */
  Object.assign(LeoObserver, {
    recordEventClickDetails: action("click-details"),
    recordEventSubmitContact: action("submit-contact"),
    recordEventAddWatchlist: action("add-watchlist"),
    recordEventRemoveWatchlist: action("remove-watchlist"),
    recordEventBuyStock: action("buy-stock"),
    recordEventCheckStock: action("check-stock"),
    recordEventSellStock: action("sell-stock"),
    recordEventRegisterAccount: action("register-account"),
    recordEventUserLogin: action("user-login"),
    recordEventUserLogout: action("user-logout"),
    recordEventAskQuestion: action("ask-question"),
    recordEventFocusIndexMetric: action("focus-index-metric"),
    recordEventAddLearningCourse: action("add-learning-course"),
    recordEventRemoveLearningCourse: action("remove-learning-course"),
    recordEventAddReadingList: action("add-reading-list"),
    recordEventRemoveReadingList: action("remove-reading-list"),
  });

  /* ============================================================
   * (2.1) Auto click tracking
   * ============================================================ */
  const trackClicks = (selector, buildData) => {
    setTimeout(function () {
      document.querySelectorAll(selector).forEach(function (el) {
        el.addEventListener("click", function () {
          LeoObserver.recordEventClickDetails(buildData(el));
        });
      });
    }, 1500);
  };

  LeoObserver.addTrackingAllLinks = function () {
    trackClicks("a", function (e) {
      return {
        url: e.getAttribute("href") || "",
        "link-text": e.innerText,
      };
    });
  };

  LeoObserver.addTrackingAllButtons = function () {
    trackClicks("button", function (e) {
      return {
        "button-text": e.innerText,
      };
    });
  };

  /* ============================================================
   * (3) CDP Ready Hook
   * ============================================================ */
  window.leoObserverProxyReady = function () {
    // Page view with UTM
    LeoObserver.recordEventPageView(window.parseDataUTM());

    // Sync visitor ID to outbound links
    proxy.synchLeoVisitorId(function (vid) {
      document.querySelectorAll("a").forEach(function (a) {
        const href = a.href || "";
        if (href.startsWith("http") && !href.includes(location.host)) {
          a.href += (href.includes("?") ? "&" : "?") + "leosyn=" + vid;
        }
      });

      // Optional GA4 sync
      if (typeof window.synchLeoCdpToGA4 === "function") {
        window.synchLeoCdpToGA4(vid);
      }
    });
  };

  // Expose observer globally
  window.LeoObserver = LeoObserver;
}