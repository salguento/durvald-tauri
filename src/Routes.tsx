import { Route } from "@solidjs/router";
import { lazy } from "solid-js";

const Home = lazy(() => import("./pages/Home"));
const Settings = lazy(() => import("./pages/Settings"));

export default function Routes() {
  return (
    <>
      <Route path="/" component={Home} />
      <Route path="/settings" component={Settings} />
    </>
  );
}
