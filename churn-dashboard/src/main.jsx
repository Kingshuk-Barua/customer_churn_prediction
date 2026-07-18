import React from "react";
import ReactDOM from "react-dom/client";
import { createHashRouter, RouterProvider } from "react-router-dom";
import App from "./App.jsx";
import CustomerList from "./pages/CustomerList.jsx";
import CustomerDetail from "./pages/CustomerDetail.jsx";
import TopChurners from "./pages/TopChurners.jsx";
import "./index.css";

const router = createHashRouter([
  {
    path: "/",
    element: <App />,
    children: [
      { index: true, element: <CustomerList /> },
      { path: "customer/:id", element: <CustomerDetail /> },
      { path: "top-churners", element: <TopChurners /> },
    ],
  },
]);

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <RouterProvider router={router} />
  </React.StrictMode>
);
