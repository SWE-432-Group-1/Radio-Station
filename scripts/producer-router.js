import { dirname, join } from 'path';
import { fileURLToPath } from 'url';
import { Dj, Song, Podcast, Playlist } from '../models/schemas.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename)

const handleAll = (app) => {
  handleDefault(app);
  handleDJPlaylist(app);
  handleAddSong(app);
};

// list of songs
var songs = [];

// tracks if current dropdown value is a dj name
let djSelected = false;

// gets list of all djs
let djs = null;

// list of playlists
let playlists = null;

const days = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun", "1", "2", "3", "4", "5", "6", "7",
  "8", "9", "10", "11", "12", "13", "14", "15", "16", "17", "18", "19", "20", "21", "22",
  "23", "24", "25", "26", "27", "28", "29"];

// gets the list of podcasts
let podcasts = null;

// adds song to playlist by order
const handleAddSong = (app) => {
  app.get("/producer/playlist/addsong/:playlistname/:songname/:index", async (req, res) => {
    const playlistname = req.params.playlistname;
    const songname = req.params.songname;
    const index = req.params.index;
    const findPlaylist = await Playlist.find({ name: playlistname });
    const songlist = await Song.find({ title: songname });
    const alreadyInPlaylist = [];
    for (let s of findPlaylist[0].songs) {
      if (s._id.toString() == songlist[0]._id.toString())
        alreadyInPlaylist.push(s);
    }
    if (findPlaylist.length == 0 || songlist.length == 0
      || alreadyInPlaylist.length > 0) {
      console.log('Invalid name or playlist or already in the playlist!');
      res.render(join(__dirname, "../views/Producer/pages/index"), {
        djs: djs,
        playlists: playlists,
        days: days,
        podcasts: podcasts,
        songs: songs,
        userHandler: "user();",
      });
    } else {
      const addSong = {
        _id: songlist[0]._id.toString(),
        producer_created: true,
        dj_played: false
      };
      const playlistID = findPlaylist[0]._id.toString();
      Playlist.findOneAndUpdate({ _id: playlistID }, { $push: { songs: { $each: [addSong], $position: (parseInt(index) - 1) } } }, { new: true })
        .then(updated => {
          console.log(updated);
          res.render(join(__dirname, "../views/Producer/pages/index"), {
            djs: djs,
            playlists: playlists,
            days: days,
            podcasts: podcasts,
            songs: songs,
            userHandler: "user();",
          });
        })
        .catch(err => {
          console.log('Failed:', err);
        })
    }
  });
}

// displays dj playlist
const handleDJPlaylist = (app) => {
  app.get("/producer/playlist/:djname", async (req, res) => {
    songs = [];
    djSelected = true;
    const djName = req.params.djname;
    const foundDJ = await Dj.find({ name: djName });
    const foundPlaylist = await Playlist.find();
    const foundSongs = await Song.find();
    const playlistbyDJID = foundPlaylist.find(p => p.dj == foundDJ[0]._id.toString());
    if (playlistbyDJID === undefined) {
      res.render(join(__dirname, "../views/Producer/pages/index"), {
        djs: djs,
        playlists: playlists,
        days: days,
        podcasts: podcasts,
        songs: songs,
        userHandler: "user();",
      });
    } else {
      for (let s of foundSongs) {
        for (let p of playlistbyDJID.songs) {
          if (s._id.toString() == p._id.toString()) {
            songs.push(s);
          }
        }
      }
      res.render(join(__dirname, "../views/Producer/pages/index"), {
        djs: djs,
        playlists: playlists,
        days: days,
        podcasts: podcasts,
        songs: songs,
        userHandler: "user();",
      });
    }
  });
}

// default
const handleDefault = (app) => {
  app.get("/producer", async (req, res) => {

    // gets the list of podcasts
    podcasts = await Podcast.find();

    // gets the list of all songs
    const foundSongs = await Song.find();
    if (songs.length == 0 && !djSelected) {
      foundSongs.forEach(s => songs.push(s));
    }

    // gets list of all djs
    djs = await Dj.find();


    // list of playlists
    playlists = await Playlist.find();

    res.render(join(__dirname, "../views/Producer/pages/index"), {
      djs: djs,
      playlists: playlists,
      days: days,
      podcasts: podcasts,
      songs: songs,
      userHandler: "user();",
    });
  });
}

export default {
  handleAll,
};