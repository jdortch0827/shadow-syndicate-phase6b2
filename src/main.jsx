import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App.jsx";
import "./index.css";

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);

function notifyUpdateReady(registration) {
  window.__SHADOW_SYNDICATE_SW_REGISTRATION__ = registration;
  window.dispatchEvent(new CustomEvent("shadow-syndicate-update-ready", { detail: { registration } }));
}

if ("serviceWorker" in navigator) {
  let refreshing = false;

  navigator.serviceWorker.addEventListener("controllerchange", () => {
    if (refreshing) return;
    refreshing = true;
    window.location.reload();
  });

  window.addEventListener("load", () => {
    navigator.serviceWorker.register("/sw.js", { updateViaCache: "none" }).then((registration) => {
      window.__SHADOW_SYNDICATE_SW_REGISTRATION__ = registration;

      if (registration.waiting && navigator.serviceWorker.controller) {
        notifyUpdateReady(registration);
      }

      registration.addEventListener("updatefound", () => {
        const worker = registration.installing;
        if (!worker) return;
        worker.addEventListener("statechange", () => {
          if (worker.state === "installed" && navigator.serviceWorker.controller) {
            notifyUpdateReady(registration);
          }
        });
      });

      // Ask the browser to check for a new service worker each time the app opens.
      registration.update().catch(() => {});
    }).catch(() => {});
  });
}
