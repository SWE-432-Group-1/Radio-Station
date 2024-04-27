import mongoose from "mongoose";

const Schema = mongoose.Schema;
const ObjectId = Schema.Types.ObjectId;

export const TimeslotSchema = new Schema({
  tdate: {
    type: String,
    required: true,
  },
  start: {
    type: String,
    required: true,
  },
  end: {
    type: String,
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
  availability: {
    type: String,
    required: true,
  },
  experience: {
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
        dj_played: {
          type: Boolean,
          required: true,
        },
      },
    ]
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
    type: String,
    required: true,
  },
  comment: {
    type: String,
    required: true,
  },
  prod: {
    type: String,
    required: true,
  },
});
export const Note = mongoose.model("Note", NoteSchema);

export const PodcastSchema = new Schema({
  name: {
    type: String,
    required: true,
  },
  episode: {
    type: Number,
    required: true,
  },
  duration: {
    type: String,
    required: true,
  },
});
export const Podcast = mongoose.model("Podcast", PodcastSchema);
