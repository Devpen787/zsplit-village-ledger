
import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";

// Import PrivyProvider
import { PrivyProvider } from "@privy-io/react-auth";

// ⚡ Replace this with your actual Privy APP ID
const PRIVY_APP_ID = "YOUR_PRIVY_APP_ID";

// Render the app within the PrivyProvider
ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <PrivyProvider appId={PRIVY_APP_ID}>
      <App />
    </PrivyProvider>
  </React.StrictMode>
);
