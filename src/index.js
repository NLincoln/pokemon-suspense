import React from "react";
import ReactDOM from "react-dom";

let root = ReactDOM.createRoot(document.getElementById("root"));

function render() {
  let App = require("./App").default;
  root.unmount();
  root.render(<App />);
}

render();

if (module.hot) {
  module.hot.accept("./App", render);
}
