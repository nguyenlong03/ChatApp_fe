import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import MessagePage from "./pages/MessagePage";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <MessagePage />
  </StrictMode>,
);
