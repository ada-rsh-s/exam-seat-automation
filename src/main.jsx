import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import ErrorHandler from "./utils/ErrorHandler";
import AlertProvider from "./components/AlertProvider";

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <ErrorHandler>
      <AlertProvider>
        <App />
      </AlertProvider>
    </ErrorHandler>
  </React.StrictMode>
);
