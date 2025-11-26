import { createSignal } from "solid-js";
import PlayBackStateType from "../types/PlayBackStateType";

export const playerStore = {
  playBackState: createSignal<PlayBackStateType>(),
};
