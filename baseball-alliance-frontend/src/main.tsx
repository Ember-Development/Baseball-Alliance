import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import { BrowserRouter } from "react-router-dom";
import "./index.css";
import { AuthProvider } from "./context/AuthContext";
import { SiteConfigProvider } from "./context/SiteConfigContext";
import { SiteEditModeProvider } from "./context/SiteEditModeContext";

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <BrowserRouter>
      <AuthProvider>
        <SiteConfigProvider>
          <SiteEditModeProvider>
            <App />
          </SiteEditModeProvider>
        </SiteConfigProvider>
      </AuthProvider>
    </BrowserRouter>
  </React.StrictMode>
);
