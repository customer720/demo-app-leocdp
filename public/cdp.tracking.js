var parseDataUTM =
  window.parseDataUTM ||
  function () {
    if (location.search.indexOf("utm_") > 0) {
      var search = location.search.substring(1);
      var json = decodeURI(search)
        .replace(/"/g, '\\"')
        .replace(/&/g, '","')
        .replace(/=/g, '":"');
      return JSON.parse('{"' + json + '"}');
    }
  };

if (typeof window.LeoObserverProxy === "object") {
  // (2) CDP EVENT OBSERVER: set-up all event tracking functions
  var LeoObserver = {};

  // to track View Event "PageView"
  LeoObserver.recordEventPageView = function (eventData) {
    eventData = eventData ? eventData : {};
    LeoObserverProxy.recordViewEvent("page-view", eventData);
  };

  LeoObserver.recordEventContentView = function (eventData) {
    eventData = eventData ? eventData : {};
    LeoObserverProxy.recordViewEvent("content-view", eventData);
  };

  LeoObserver.recordEventStockView = function (eventData) {
    eventData = eventData ? eventData : {};
    LeoObserverProxy.recordViewEvent("stock-view", eventData);
  };

  //  track Action Event "ClickDetails"
  LeoObserver.recordEventClickDetails = function (eventData) {
    eventData = eventData ? eventData : {};
    LeoObserverProxy.recordActionEvent("click-details", eventData);
  };

  // track Action Event "SubmitContact"
  LeoObserver.recordEventSubmitContact = function (eventData) {
    eventData = eventData ? eventData : {};
    LeoObserverProxy.recordActionEvent("submit-contact", eventData);
  };

  // track Action Event "add-watchlist"
  LeoObserver.recordEventAddWatchlist = function (eventData) {
    eventData = eventData ? eventData : {};
    LeoObserverProxy.recordActionEvent("add-watchlist", eventData);
  };

  //  track Action Event "remove-watchlist"
  LeoObserver.recordEventRemoveWatchlist = function (eventData) {
    eventData = eventData ? eventData : {};
    LeoObserverProxy.recordActionEvent("remove-watchlist", eventData);
  };

  // function to track Action Event "buy-stock"
  LeoObserver.recordEventBuyStock = function (eventData) {
    eventData = eventData ? eventData : {};
    LeoObserverProxy.recordActionEvent("buy-stock", eventData);
  };

  // function to track Action Event "buy-stock"
  LeoObserver.recordEventCheckStock = function (eventData) {
    eventData = eventData ? eventData : {};
    LeoObserverProxy.recordActionEvent("check-stock", eventData);
  };

  // function to track Action Event "sell-stock"
  LeoObserver.recordEventSellStock = function (eventData) {
    eventData = eventData ? eventData : {};
    LeoObserverProxy.recordActionEvent("sell-stock", eventData);
  };

  // (2.5) function to track Action Event "RegisterAccount"
  LeoObserver.recordEventRegisterAccount = function (eventData) {
    eventData = eventData ? eventData : {};
    LeoObserverProxy.recordActionEvent("register-account", eventData);
  };

  // (2.6) function to track Action Event "UserLogin"
  LeoObserver.recordEventUserLogin = function (eventData) {
    eventData = eventData ? eventData : {};
    LeoObserverProxy.recordActionEvent("user-login", eventData);
  };

  LeoObserver.recordEventUserLogout = function (eventData) {
    eventData = eventData ? eventData : {};
    LeoObserverProxy.recordActionEvent("user-logout", eventData);
  };

  // (2.7) function to track Action Event "AskQuestion"
  LeoObserver.recordEventAskQuestion = function (eventData) {
    eventData = eventData ? eventData : {};
    LeoObserverProxy.recordActionEvent("ask-question", eventData);
  };

  // (2.8) function to track Conversion Event "Purchase"
  LeoObserver.recordEventPurchase = function (
    eventData,
    shoppingCartItems,
    transactionId,
    transactionValue,
    currencyCode
  ) {
    // need 5 params
    eventData = typeof eventData === "object" ? eventData : {};
    shoppingCartItems =
      typeof shoppingCartItems === "object" ? shoppingCartItems : [];
    transactionId = typeof transactionId === "string" ? transactionId : "";
    transactionValue =
      typeof transactionValue === "number" ? transactionValue : 0;
    currencyCode = typeof currencyCode === "string" ? currencyCode : "USD";
    LeoObserverProxy.recordConversionEvent(
      "purchase",
      eventData,
      transactionId,
      shoppingCartItems,
      transactionValue,
      currencyCode
    );
  };

  // track users when they click any link in the web-page
  LeoObserver.addTrackingAllLinks = function () {
    setTimeout(function () {
      document.querySelectorAll("a").forEach(function (e) {
        e.addEventListener("click", function () {
          var url = e.getAttribute("href") || "";
          var data = { url: url, "link-text": e.innerText };
          LeoObserver.recordEventClickDetails(data);
        });
      });
    }, 1500);
  };

  // track users when they click any button in the web-page
  LeoObserver.addTrackingAllButtons = function () {
    setTimeout(function () {
      document.querySelectorAll("button").forEach(function (e) {
        e.addEventListener("click", function () {
          var data = { "button-text": e.innerText };
          LeoObserver.recordEventClickDetails(data);
        });
      });
    }, 1600);
  };

  // (3) CDP EVENT OBSERVER is ready
  window.leoObserverProxyReady = function () {
    // auto tracking when CDP JS is ready
    LeoObserver.recordEventPageView(parseDataUTM());

    // set tracking CDP web visitor ID into all a[href] nodes
    LeoObserverProxy.synchLeoVisitorId(function (vid) {
      var aNodes = document.querySelectorAll("a");
      [].forEach.call(aNodes, function (aNode) {
        var hrefUrl = aNode.href || "";
        var check =
          hrefUrl.indexOf("http") >= 0 && hrefUrl.indexOf(location.host) < 0;
        if (check) {
          if (hrefUrl.indexOf("?") > 0) hrefUrl += "&leosyn=" + vid;
          else hrefUrl += "?leosyn=" + vid;
          aNode.href = hrefUrl;
        }
      });
      if (typeof window.synchLeoCdpToGA4 === "function") {
        window.synchLeoCdpToGA4(vid);
      }
    });
  };
}
