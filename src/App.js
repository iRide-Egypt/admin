import React from "react";
import { Provider } from "react-redux";
import { BrowserRouter as Router, Route, Switch,HashRouter } from "react-router-dom";
import { configureStore } from "Redux/store";

import App from "Containers/App";

const MainApp = () => (
  <Provider store={configureStore()}>
    <Router>
      <HashRouter>
        <Route path="/" component={App} />
      </HashRouter>
    </Router>
  </Provider>
);

export default MainApp;
