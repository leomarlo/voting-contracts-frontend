import React from "react";

import { createRoot } from "react-dom/client";
import { Dapp } from "./Dapp";
import { AppTest } from "./components/Test2";

import "bootstrap/dist/css/bootstrap.min.css";
import "./styles/main.css";

const root: HTMLElement = document.getElementById("root") as HTMLElement;

createRoot(root).render(
  <React.StrictMode>
    <Dapp />
  </React.StrictMode>
);
