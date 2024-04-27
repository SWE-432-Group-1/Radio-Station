import { dirname, join } from "path";
import { fileURLToPath } from "url";
import { Dj, Playlist, Song, Timeslot } from "../models/schemas.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const handleAll = (app) => {
  app.get("/dj", async (_req, res) => {
    const djs = await Dj.find();

    res.render(join(__dirname, "../views/DJ/selectDj.ejs"), {
      djs,
    });
  });

  app.get("/dj/setdj/:djId", async (req, res) => {
    const { djId } = req.params;

    let timeslot;
    try {
      timeslot = await Timeslot.findOne({ dj: djId });
      if (timeslot === null || timeslot === undefined) {
        throw new Error("Timeslot query returned null");
      }
    } catch (error) {
      console.error("No timeslots found", error);
      res.status(404).send("No timeslot found");
      return;
    }

    req.session.djId = djId;

    res.redirect(`/dj/${timeslot.id}`);
  });

  app.get("/dj/:timeslotId", async (req, res) => {
    const { timeslotId } = req.params;

    if (req.session.djId === undefined || req.session.djId === null) {
      res.redirect("/dj");
      return;
    }

    const dj = await Dj.findById(req.session.djId);

    if (!dj) {
      res.redirect("/dj");
      return;
    }

    let timeslots;
    let timeslot;
    try {
      timeslots = await Timeslot.find({ dj: req.session.djId });
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

    try {
      playlistSongs = playlist.songs.map((a) => {
        const songDef = playlistSongs.find((song) => song.id == a.song);
        if (songDef === undefined || songDef === null) {
          throw new Error(`Song not found in playlist ${a.song}`);
        }

        return {
          ...songDef.toObject(),
          id: songDef.id,
          playlistSongId: a.id,
          dj_played: a.dj_played,
          producer_created: a.producer_created,
        };
      });
    } catch (error) {
      console.error("Failed to map playlist songs", playlist.songs, error);
      res.status(500).send("Failed to map playlist songs");
      return;
    }

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

    let previousPlaylists;
    try {
      previousPlaylists = await Playlist.find({
        dj: req.session.djId,
        _id: { $ne: playlist.id },
      });
      if (previousPlaylists === null || previousPlaylists === undefined) {
        throw new Error("Previous playlists query returned null");
      }
    } catch (error) {
      console.error("Failed to fetch previous playlists", error);
      res.status(500).send("Failed to fetch previous playlists");
      return;
    }

    try {
      previousPlaylists = previousPlaylists.map((playlist) => {
        const songs = playlist.songs.map((a) => {
          const songDef = allSongs.find((song) => song.id == a.song);
          if (songDef === undefined || songDef === null) {
            throw new Error(`Song not found in playlist ${a.song}`);
          }

          return {
            ...songDef.toObject(),
            id: songDef.id,
            playlistSongId: a.id,
            dj_played: a.dj_played,
            producer_created: a.producer_created,
          };
        });

        return {
          ...playlist.toObject(),
          id: playlist.id,
          songs,
        };
      });
    } catch (error) {
      console.error("Failed to map previous playlists", error);
      res.status(500).send("Failed to map previous playlists");
      return;
    }

    res.render(join(__dirname, "../views/DJ/main.ejs"), {
      timeslots: timeslots.map((slot) => ({
        ...slot,
        id: slot.id.toString(),
        selected: slot.id === timeslotId,
        label: `${slot.tdate} ${slot.start} - ${slot.end}`,
      })),
      playlist,
      playlistSongs,
      allSongs,
      previousPlaylists,
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

  app.post(
    "/dj/api/playlist/:timeslotId/copy/:otherPlaylistId",
    async (req, res) => {
      const { timeslotId, otherPlaylistId } = req.params;

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

      let otherPlaylist;
      try {
        otherPlaylist = await Playlist.findById(otherPlaylistId);
        if (otherPlaylist === null || otherPlaylist === undefined) {
          throw new Error("Other playlist query returned null");
        }
      } catch (error) {
        console.error("Failed to find other playlist", otherTimeslotId, error);
        res.status(404).json({ error: "Other playlist not found" });
        return;
      }

      playlist.songs = playlist.songs.concat(
        otherPlaylist.songs.map((song) => {
          return {
            song: song.song,
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
    }
  );

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

  app.put("/dj/api/playlist/:timeslotId/:id/mark_played", async (req, res) => {
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

    const songIndex = playlist.songs.findIndex((song) => song.id == id);

    if (songIndex === -1) {
      console.error("Song not found in playlist", id, playlist.songs);
      res.status(404).json({ error: "Song not found" });
      return;
    }

    try {
      playlist.songs[songIndex].dj_played = true;
      playlist.markModified("songs");
      await playlist.save();
    } catch (error) {
      console.error("Failed to update song", id, error);
      res.status(500).json({ error: "Failed to update song" });
      return;
    }

    res.json(playlist.songs[songIndex]);
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

    if (!playlist.songs.some((song) => song.id == id)) {
      console.error("Song not found in playlist", id, playlist.songs);
      res.status(404).json({ error: "Song not found" });
      return;
    }

    playlist.songs = playlist.songs.filter((song) => song.id != id);

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
        error: `Order must have the same number of items as the playlist (found ${order.length}, expected ${playlist.songs.length})`,
      });
      return;
    }

    let mapErrored = false;

    const newPlaylist = order.map((id) => {
      if (mapErrored) return;

      const song = playlist.songs.find((slot) => slot.song == id);

      if (!song) {
        res.status(400).json({ error: `Song with ID ${id} not found` });
        mapErrored = true;
        return;
      }

      return {
        song: song.song,
        producer_created: song.producer_created,
        dj_played: song.dj_played,
      };
    });

    if (mapErrored) return;

    try {
      playlist.songs = newPlaylist;
      playlist.markModified("songs");
      await playlist.save({ validateBeforeSave: true });
    } catch (error) {
      console.error("Failed to update playlist", playlist.id, error);
      res.status(500).json({ error: "Failed to update playlist" });
      return;
    }

    res.json({ success: true });
  });

  app.get("/dj/session/exit", async (req, res) => {
    req.session.destroy();
    res.redirect("/dj");
  });
};

export default {
  handleAll,
};
