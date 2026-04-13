import { createRoot } from "react-dom/client";
import { defineCustomElements as jeepSqlite } from 'jeep-sqlite/loader';
import App from "./App.tsx";
import "./index.css";

// Initialize the jeep-sqlite web component and start the app
async function bootstrap() {
  await jeepSqlite(window);
  createRoot(document.getElementById("root")!).render(<App />);
}

bootstrap();



