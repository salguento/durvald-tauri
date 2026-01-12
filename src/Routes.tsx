import { Route } from "@solidjs/router";
import { lazy } from "solid-js";

const Home = lazy(() => import("./pages/Home"));
const Settings = lazy(() => import("./pages/Settings"));
const ReleasePage = lazy(() => import("./pages/ReleasePage"));
const Artist = lazy(() => import("./pages/Artist"));
const AllArtists = lazy(() => import("./pages/AllArtists"));
const AllReleases = lazy(() => import("./pages/AllReleases"));
const AllSongs = lazy(() => import("./pages/AllSongs"));
const AllGenres = lazy(() => import("./pages/AllGenres"));
const Search = lazy(() => import("./pages/Search"));
const Stats = lazy(() => import("./pages/Stats"));
const ListenLater = lazy(() => import("./pages/ListenLater"));
const New = lazy(() => import("./pages/New"));
const RecentlyAdded = lazy(() => import("./pages/RecentlyAdded"));
const AllPlaylists = lazy(() => import("./pages/AllPlaylists"));
const FavoriteSongs = lazy(() => import("./pages/FavoriteSongs"));
const Create = lazy(() => import("./pages/Create"));
const Library = lazy(() => import("./pages/Library"));

export default function Routes() {
  return (
    <>
      <Route path="/" component={Home} />
      <Route path="/settings" component={Settings} />
      <Route path="/release/:id" component={ReleasePage} />
      <Route path="/artist/:id" component={Artist} />
      <Route path="/all-artists" component={AllArtists} />
      <Route path="/all-releases" component={AllReleases} />
      <Route path="/all-songs" component={AllSongs} />
      <Route path="/all-genres" component={AllGenres} />
      <Route path="/search" component={Search} />
      <Route path="/stats" component={Stats} />
      <Route path="/listen-later" component={ListenLater} />
      <Route path="/new" component={New} />
      <Route path="/recently-added" component={RecentlyAdded} />
      <Route path="/all-playlists" component={AllPlaylists} />
      <Route path="/favorite-songs" component={FavoriteSongs} />
      <Route path="/create" component={Create} />
      <Route path="/library" component={Library} />
    </>
  );
}
