import * as React from "react";
import * as ReactDOM from "react-dom";
import App from "./App";

const container = document.getElementById("root");
if (!container) throw new Error("Failed to find the root element");
ReactDOM.render(React.createElement(App), container);
