
import React from "react";
import ReactDOM from "react-dom/client";

import "bootstrap/dist/css/bootstrap.min.css";
import "react-toastify/dist/ReactToastify.css";
import "./index.css";
import { ToastContainer } from "react-toastify";

import App from "./App";

ReactDOM.createRoot(
    document.getElementById("root")!
).render(

    <React.StrictMode>

        <App />

        <ToastContainer
            position="top-right"
            autoClose={3000}
        />

    </React.StrictMode>

);
