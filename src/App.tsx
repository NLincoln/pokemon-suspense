// @ts-check
/// <reference types='react/experimental' />
/// <reference types='react-dom/experimental' />

import React, { Suspense } from "react";
import LinearProgress from "@material-ui/core/LinearProgress";

import HomePage from "./routes/HomePage";

function App() {
  return (
    <Suspense fallback={<LinearProgress />}>
      <HomePage />
    </Suspense>
  );
}

export default App;
