import { dirname, join } from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const playlistRows = [
  { id: 1, position: 1, title: "Song 1", producer: "Producer 1" },
  { id: 2, position: 2, title: "Song 2", producer: "Producer 2" },
  { id: 3, position: 3, title: "Song 3", producer: "Producer 3" },
  { id: 4, position: 4, title: "Song 4", producer: "Producer 4" },
  { id: 5, position: 5, title: "Song 5", producer: "Producer 5" },
];

const timeslotList = [
  {
    id: 1,
    date: "1969-01-01",
    start_time: "10:00",
    end_time: "11:00",
    playlist: playlistRows.map((row) => ({
      ...row,
      title: `${row.title} (10am)`,
    })),
  },
  {
    id: 2,
    date: "1969-01-01",
    start_time: "11:00",
    end_time: "12:00",
    playlist: playlistRows.map((row) => ({
      ...row,
      title: `${row.title} (11am)`,
    })),
  },
  {
    id: 3,
    date: "1969-01-01",
    start_time: "12:00",
    end_time: "13:00",
    playlist: playlistRows.map((row) => ({
      ...row,
      title: `${row.title} (12pm)`,
    })),
  },
  {
    id: 4,
    date: "1969-01-01",
    start_time: "13:00",
    end_time: "14:00",
    playlist: playlistRows.map((row) => ({
      ...row,
      title: `${row.title} (1pm)`,
    })),
  },
  {
    id: 5,
    date: "1969-01-01",
    start_time: "14:00",
    end_time: "15:00",
    playlist: playlistRows.map((row) => ({
      ...row,
      title: `${row.title} (2pm)`,
    })),
  },
];

const handleAll = (app) => {
  app.get("/dj", (req, res) => {
    if (timeslotList.length === 0) {
      res.status(404).send("No timeslot found");
      return;
    }

    const firstTimeslot = timeslotList[0];

    res.redirect(`/dj/${firstTimeslot.id}`);
  });

  app.get("/dj/:timeslotId", (req, res) => {
    const { timeslotId } = req.params;

    const idNum = parseInt(timeslotId);

    if (isNaN(idNum)) {
      res.status(400).send("Playlist ID must be a number");
      return;
    }

    const timeslot = timeslotList.find(
      (slot) => slot.id === parseInt(timeslotId)
    );

    if (!timeslot) {
      res.status(404).send("Playlist not found");
      return;
    }

    res.render(join(__dirname, "../views/DJ/main.ejs"), {
      timeslots: timeslotList.map((slot) => ({
        ...slot,
        selected: slot.id === idNum,
        label: `${slot.date} ${slot.start_time} - ${slot.end_time}`,
      })),
      motd: "MOTD In Express!",
      playlist: timeslot.playlist,
    });
  });

  app.put("/dj/api/playlist/:timeslotId/:id", (req, res) => {
    const { timeslotId, id } = req.params;
    const { title } = req.body;

    if (!title) {
      res.status(400).json({ error: "Title is required" });
      return;
    }

    const idNum = parseInt(id);

    if (isNaN(idNum)) {
      res.status(400).json({ error: "Invalid song ID" });
      return;
    }

    const timeslotIdNum = parseInt(timeslotId);

    if (isNaN(timeslotIdNum)) {
      res.status(400).json({ error: "Invalid timeslot ID" });
      return;
    }

    const timeslot = timeslotList.find((slot) => slot.id === timeslotIdNum);

    if (!timeslot) {
      res.status(404).json({ error: "Timeslot not found" });
      return;
    }

    const song = timeslot.playlist.find((song) => song.id === idNum);

    song.title = title;
    res.json(song);
  });

  app.delete("/dj/api/playlist/:timeslotId/:id", (req, res) => {
    const { timeslotId, id } = req.params;

    const idNum = parseInt(id);

    if (isNaN(idNum)) {
      res.status(400).json({ error: "Invalid song ID" });
      return;
    }

    const timeslotIdNum = parseInt(timeslotId);

    if (isNaN(timeslotIdNum)) {
      res.status(400).json({ error: "Invalid timeslot ID" });
      return;
    }

    const timeslot = timeslotList.find((slot) => slot.id === timeslotIdNum);

    if (timeslot === -1) {
      res.status(404).json({ error: "Timeslot not found" });
      return;
    }

    const index = timeslot.playlist.findIndex((song) => song.id === idNum);

    if (index === -1) {
      res.status(404).json({ error: "Song not found" });
      return;
    }

    timeslot.playlist.splice(index, 1);
    res.json({ success: true });
  });

  app.put("/dj/api/playlist_order/:timeslotId", (req, res) => {
    const { timeslotId } = req.params;
    const order = req.body;

    const timeslotIdNum = parseInt(timeslotId);

    if (isNaN(timeslotIdNum)) {
      res.status(400).json({ error: "Invalid timeslot ID" });
      return;
    }

    if (!Array.isArray(order)) {
      res.status(400).json({ error: "Order must be an array" });
      return;
    }

    const timeslot = timeslotList.find((slot) => slot.id === timeslotIdNum);

    if (!timeslot) {
      res.status(404).json({ error: "Timeslot not found" });
      return;
    }

    if (order.length !== timeslot.playlist.length) {
      res.status(400).json({
        error: "Order must have the same number of items as the playlist",
      });
      return;
    }

    const currentPlaylist = timeslot.playlist;

    const newPlaylist = order.map((id, index) => {
      const timeslot = currentPlaylist.find((slot) => slot.id === id);

      if (!timeslot) {
        res.status(400).json({ error: `Timeslot with ID ${id} not found` });
        return;
      }

      timeslot.position = index + 1;

      return timeslot;
    });

    currentPlaylist.length = 0;
    newPlaylist.forEach((slot) => currentPlaylist.push(slot));

    res.json({ success: true });
  });
};

export default {
  handleAll,
};
