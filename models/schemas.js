import mongoose from "mongoose";

const Schema = mongoose.Schema;
const ObjectId = Schema.Types.ObjectId;

export const TimeslotSchema = new Schema({
  start: {
    type: Date,
    required: true,
  },
  end: {
    type: Date,
    required: true,
  },
  dj: {
    type: ObjectId,
    ref: "Dj",
    required: true,
  }
});
export const Timeslot = mongoose.model("Timeslot", TimeslotSchema);

export const DjSchema = new Schema({
  name: {
    type: String,
    required: true,
  },
});
export const Dj = mongoose.model("Dj", DjSchema);

export const SongSchema = new Schema({
  title: {
    type: String,
    required: true,
  },
  artist: {
    type: String,
    required: true,
  },
});
export const Song = mongoose.model("Song", SongSchema);

export const PlaylistSchema = new Schema({
  name: {
    type: String,
    required: true,
  },
  dj: {
    type: ObjectId,
    ref: "Dj",
    required: true,
  },
  songs: {
    type: [
      {
        song: {
          type: ObjectId,
          ref: "Song",
          required: true,
        },
        producer_created: {
          type: Boolean,
          required: true,
        },
      },
    ],
    required: true,
  },
  timeslot: {
    type: ObjectId,
    ref: "Timeslot",
    required: true,
  },
});
export const Playlist = mongoose.model("Playlist", PlaylistSchema);

export const NoteSchema = new Schema({
  pdate: {
    type: Date,
    required: true,
  },
  comments: {
    type: String,
    required: true,
  },
});
export const Note = mongoose.model("Note", NoteSchema);