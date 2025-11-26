import { createSignal } from "solid-js";
import PlayBackStateType from "../types/PlayBackStateType";
import SongType from "../types/songType";

export const playerStore = {
  playBackState: createSignal<PlayBackStateType>(),
  currentTrack: createSignal<SongType>(),
};
