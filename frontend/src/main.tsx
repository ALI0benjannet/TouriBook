import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "@/i18n";          // ⚠️ avant App : initialise langue + dir
import "@/index.css";
import App from "@/App";
import { Providers } from "@/app/providers";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <Providers>
      <App />
    </Providers>
  </StrictMode>,
);