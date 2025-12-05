import { Route } from "@solidjs/router";
import { lazy } from "solid-js";

const Home = lazy(() => import("./pages/Home"));
const Settings = lazy(() => import("./pages/Settings"));
const ReleasePage = lazy(() => import("./pages/ReleasePage"));
const Artist = lazy(() => import("./pages/Artist"));
const AllArtists = lazy(() => import("./pages/AllArtists"));

export default function Routes() {
  return (
    <>
      <Route path="/" component={Home} />
      <Route path="/settings" component={Settings} />
      <Route path="/release/:id" component={ReleasePage} />
      <Route path="/artist/:id" component={Artist} />
      <Route path="/all-artists" component={AllArtists} />
    </>
  );
}
