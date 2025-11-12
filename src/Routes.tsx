import { Route } from "@solidjs/router";
import { lazy } from "solid-js";

const Home = lazy(() => import("./pages/Home"));
const Settings = lazy(() => import("./pages/Settings"));
const Album = lazy(() => import("./pages/Album"));
const Artist = lazy(() => import("./pages/Artist"));

export default function Routes() {
  return (
    <>
      <Route path="/" component={Home} />
      <Route path="/settings" component={Settings} />
      <Route path="/album/:id" component={Album} />
      <Route path="/artist/:id" component={Artist} />
    </>
  );
}
