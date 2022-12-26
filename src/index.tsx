import React from "react";

import { createRoot } from "react-dom/client";
import { Dapp } from "./Dapp";
import { App, Index2 } from "./index2";

import "bootstrap/dist/css/bootstrap.min.css";
import "./styles/main.css";

const root: HTMLElement = document.getElementById("root") as HTMLElement;

createRoot(root).render(
  <React.StrictMode>
    <Index2 />
  </React.StrictMode>
);
