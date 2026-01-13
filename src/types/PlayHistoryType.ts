import TrackType from "./Track";

export interface HistoryType {
  history_id: number;
  song_id: number;
  playedAt: string;
  playDuration: number;
}

export interface FormattedHistoryType {
  historyId: number;
  track: TrackType[];
}
