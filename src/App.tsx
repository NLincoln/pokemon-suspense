// @ts-check
/// <reference types='react/experimental' />
/// <reference types='react-dom/experimental' />

import React, { Suspense } from "react";
import LinearProgress from "@material-ui/core/LinearProgress";

import HomePage from "./HomePage/HomePage";
import { BrowserRouter as Router, Route } from "react-router-dom";
import PokemonDetail from "./PokemonDetail/PokemonDetail";

function App() {
  return (
    <Router>
      <Suspense fallback={<LinearProgress />}>
        <Route path={"/"} component={HomePage} exact />
        <Route path={"/pokemon/:pokemon_id"} component={PokemonDetail} exact />
      </Suspense>
    </Router>
  );
}

export default App;
