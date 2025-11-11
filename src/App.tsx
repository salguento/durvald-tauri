// Dependencies
import "./App.css";
import { Router, Route } from "@solidjs/router";
import "overlayscrollbars/overlayscrollbars.css";
// Pages
import Routes from "./Routes";
import Layout from "./pages/Layout";
// Components
import { ErrorBoundary } from "solid-js";

function App() {
  return (
    <ErrorBoundary
      fallback={(err) => {
        console.error("Error:", err);
        return <div>Something went wrong: {err.toString()}</div>;
      }}
    >
      <Router>
        <Route path="/" component={Layout}>
          <Routes />
        </Route>
      </Router>
    </ErrorBoundary>
  );
}

export default App;
