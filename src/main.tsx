import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";

console.log("MAIN START");
console.log("[DurianCount] System Booting...");

// Global Error Catching for Early Crashes
window.onerror = function(message, source, lineno, colno, error) {
  console.error("[CRITICAL] Global App Crash:", { message, source, lineno, colno, error });
  return false;
};

window.onunhandledrejection = function(event) {
  console.error("[CRITICAL] Unhandled Promise Rejection:", event.reason);
};

const rootElement = document.getElementById("root");

if (!rootElement) {
  console.error("[CRITICAL] Root element NOT FOUND. Ensure index.html has <div id='root'></div>");
  // Basic fallback UI if DOM is broken
  document.body.innerHTML = "<div style='display:flex; height:100vh; align-items:center; justify-content:center; font-family:sans-serif;'>Gagal memuat sistem: Root element tidak ditemukan.</div>";
} else {
  try {
    const root = createRoot(rootElement);
    root.render(<App />);
    console.log("[DurianCount] Main Application Mounted");
  } catch (err) {
    console.error("[CRITICAL] Mounting Failure:", err);
  }
}
