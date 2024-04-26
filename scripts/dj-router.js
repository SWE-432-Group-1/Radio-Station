import { dirname, join } from "path";
import { fileURLToPath } from "url";
import { Playlist, Song, Timeslot } from "../models/schemas.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const handleAll = (app) => {
  app.get("/dj", async (_req, res) => {
    let timeslot;
    try {
      timeslot = await Timeslot.findOne();
      if (timeslot === null || timeslot === undefined) {
        throw new Error("Timeslot query returned null");
      }
    } catch (error) {
      console.error("No timeslots found", error);
      res.status(404).send("No timeslot found");
      return;
    }

    res.redirect(`/dj/${timeslot.id}`);
  });

  app.get("/dj/:timeslotId", async (req, res) => {
    const { timeslotId } = req.params;

    let timeslots;
    let timeslot;
    try {
      timeslots = await Timeslot.find();
      timeslot = await Timeslot.findById(timeslotId);
      if (timeslots === null || timeslots === undefined) {
        throw new Error("Timeslots query returned null");
      }

      if (timeslot === undefined || timeslot === null) {
        throw new Error("Timeslot query returned null");
      }
    } catch (error) {
      console.error("Failed getting timeslot(s)", timeslotId, error);
      res.status(404).send("Timeslot not found");
      return;
    }

    let playlist;
    try {
      playlist = await Playlist.findOne({ timeslot: timeslotId });
      if (!playlist) {
        throw new Error("Playlist not found");
      }
    } catch (error) {
      console.error("Failed to fetch playlist", timeslotId);
      res.status(500).send("Failed to fetch playlist");
      return;
    }

    let playlistSongs;
    try {
      playlistSongs = await Song.find({
        _id: { $in: playlist.songs.map((song) => song.song) },
      });
      if (playlistSongs === null || playlistSongs === undefined) {
        throw new Error("Playlist songs query returned null");
      }
    } catch (error) {
      console.error("Failed to fetch playlist songs", playlist.songs, error);
      res.status(500).send("Failed to fetch playlist songs");
      return;
    }
    playlistSongs.sort((a, b) => {
      return (
        playlist.songs.findIndex((song) => song.id === a.id) -
        playlist.songs.findIndex((song) => song.id === b.id)
      );
    });

    let allSongs;
    try {
      allSongs = await Song.find();
      if (allSongs === undefined || allSongs === null) {
        throw new Error("Songs query returned null");
      }
    } catch (error) {
      console.error("Failed to fetch songs", error);
      res.status(500).send("Failed to fetch songs");
      return;
    }

    res.render(join(__dirname, "../views/DJ/main.ejs"), {
      timeslots: timeslots.map((slot) => ({
        ...slot,
        id: slot.id.toString(),
        selected: slot.id === timeslotId,
        label: `${slot.tdate} ${slot.start} - ${slot.end}`,
      })),
      motd: "MOTD In Express!",
      playlist: playlist,
      playlistSongs,
      allSongs,
    });
  });

  app.post("/dj/api/playlist/:timeslotId", async (req, res) => {
    const { timeslotId } = req.params;
    const { songs: songIds } = req.body;

    if (!Array.isArray(songIds)) {
      console.error("Songs must be an array", songIds);
      res.status(400).json({ error: "Songs must be an array" });
      return;
    }

    let playlist;
    try {
      playlist = await Playlist.findOne({ timeslot: timeslotId });
      if (playlist === null || playlist === undefined) {
        throw new Error("Playlist query returned null");
      }
    } catch (error) {
      console.error("Failed to find playlist", timeslotId, error);
      res.status(404).json({ error: "Playlist not found" });
      return;
    }

    let allSongs;
    try {
      allSongs = await Song.find({ _id: { $in: songIds } });
      if (allSongs === null || allSongs === undefined) {
        throw new Error("Songs query returned null");
      }
    } catch (error) {
      console.error("Failed to find songs", songIds, error);
      res.status(404).json({ error: "Songs not found" });
      return;
    }

    playlist.songs = playlist.songs.concat(
      allSongs.map((song) => {
        return {
          song: song.id,
          producer_created: false,
          dj_played: false,
        };
      })
    );

    let updatedPlaylist;
    try {
      updatedPlaylist = await Playlist.findByIdAndUpdate(playlist.id, {
        songs: playlist.songs,
      });

      if (updatedPlaylist === null || updatedPlaylist === undefined) {
        throw new Error("Playlist update returned null");
      }
    } catch (error) {
      console.error("Failed to update playlist", playlist.id, error);
      res.status(500).json({ error: "Failed to update playlist" });
      return;
    }

    res.json(updatedPlaylist);
  });

  app.put("/dj/api/playlist/:timeslotId/:id", async (req, res) => {
    const { timeslotId, id } = req.params;
    const { title } = req.body;

    if (!title) {
      console.error("Title is required", title);
      res.status(400).json({ error: "Title is required" });
      return;
    }

    let playlist;
    try {
      playlist = await Playlist.findOne({ timeslot: timeslotId });
      if (playlist === null || playlist === undefined) {
        throw new Error("Playlist query returned null");
      }
    } catch (error) {
      console.error("Failed to find playlist", timeslotId, error);
      res.status(404).json({ error: "Playlist not found" });
      return;
    }

    const song = playlist.songs.find((song) => song.song == id);

    if (!song) {
      console.error("Song not found in playlist", id, playlist.songs);
      res.status(404).json({ error: "Song not found" });
      return;
    }

    let updatedSong;
    try {
      updatedSong = await Song.findByIdAndUpdate(id, { title: title });
      if (updatedSong === null || updatedSong === undefined) {
        throw new Error("Song update returned null");
      }
    } catch (error) {
      console.error("Failed to update song", id, title, error);
      res.status(500).json({ error: "Failed to update song" });
      return;
    }

    res.json(updatedSong);
  });

  app.delete("/dj/api/playlist/:timeslotId/:id", async (req, res) => {
    const { timeslotId, id } = req.params;

    let playlist;
    try {
      playlist = await Playlist.findOne({ timeslot: timeslotId });
      if (playlist === null || playlist === undefined) {
        throw new Error("Playlist query returned null");
      }
    } catch (error) {
      console.error("Failed to find playlist", timeslotId, error);
      res.status(404).json({ error: "Playlist not found" });
      return;
    }

    if (!playlist.songs.some((song) => song.song == id)) {
      console.error("Song not found in playlist", id, playlist.songs);
      res.status(404).json({ error: "Song not found" });
      return;
    }

    playlist.songs = playlist.songs.filter((song) => song.song != id);

    try {
      const updatedPlaylist = await Playlist.findByIdAndUpdate(playlist.id, {
        songs: playlist.songs,
      });

      if (updatedPlaylist === null || updatedPlaylist === undefined) {
        throw new Error("Playlist update returned null");
      }
    } catch (error) {
      console.error("Failed to update playlist", playlist.id, error);
      res.status(500).json({ error: "Failed to update playlist" });
      return;
    }

    res.json({ success: true });
  });

  app.put("/dj/api/playlist_order/:timeslotId", async (req, res) => {
    const { timeslotId } = req.params;
    const order = req.body;

    if (!Array.isArray(order)) {
      res.status(400).json({ error: "Order must be an array" });
      return;
    }

    let playlist;
    try {
      playlist = await Playlist.findOne({ timeslot: timeslotId });
      if (playlist === null || playlist === undefined) {
        throw new Error("Playlist not found");
      }
    } catch (error) {
      console.error("Failed to find playlist", timeslotId, error);
      res.status(404).json({ error: "Playlist not found" });
      return;
    }

    if (order.length !== playlist.songs.length) {
      res.status(400).json({
        error: "Order must have the same number of items as the playlist",
      });
      return;
    }

    const newPlaylistWithOrdering = order.map((id, index) => {
      const song = playlist.songs.find((slot) => slot.song == id);

      if (!song) {
        res.status(400).json({ error: `Song with ID ${id} not found` });
        return;
      }

      song.position = index;

      return song;
    });

    newPlaylistWithOrdering.sort((a, b) => {
      return a.position - b.position;
    });

    const newPlaylist = newPlaylistWithOrdering.map((song) => ({
      ...song,
      position: undefined,
    }));

    try {
      const updatedPlaylist = await Playlist.findByIdAndUpdate(playlist.id, {
        songs: newPlaylist,
      });

      if (updatedPlaylist === null || updatedPlaylist === undefined) {
        throw new Error("Playlist update returned null");
      }
    } catch (error) {
      console.error("Failed to update playlist", playlist.id, error);
      res.status(500).json({ error: "Failed to update playlist" });
      return;
    }

    res.json({ success: true });
  });
};

export default {
  handleAll,
};
