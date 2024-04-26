import { dirname, join } from 'path';
import { fileURLToPath } from 'url';
import { Dj, Song, Podcast, Playlist } from '../models/schemas.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename)

// handler for all
const handleAll = (app) => {
  handleDefault(app);
  handleDJPlaylist(app);
  handleAddSong(app);
  handleRemoveSong(app);
  handleSongSearch(app);
  handleReset(app);
};

// list of songs
var songs = [];

// tracks if current dropdown value is a dj name
let djSelected = false;

// gets list of all djs
let djs = null;

// days of the calendar
const days = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun", "1", "2", "3", "4", "5", "6", "7",
  "8", "9", "10", "11", "12", "13", "14", "15", "16", "17", "18", "19", "20", "21", "22",
  "23", "24", "25", "26", "27", "28", "29"];

// gets the list of podcasts
let podcasts = null;

// dropdown dj name
let djName = null;

// default
const handleDefault = (app) => {
  app.get("/producer", async (req, res) => {

    // default dropdown
    if (!djSelected)
      djName = "Select DJ";

    // gets the list of podcasts
    podcasts = await Podcast.find();

    // gets the list of all songs
    const foundSongs = await Song.find();
    if (songs.length == 0 && !djSelected) {
      foundSongs.forEach(s => songs.push(s));
    }

    // gets list of all djs
    djs = await Dj.find();

    res.render(join(__dirname, "../views/Producer/pages/index"), {
      djName: djName,
      djs: djs,
      //playlists: playlists,
      days: days,
      podcasts: podcasts,
      songs: songs,
      userHandler: "user();",
    });
  });
}

// adds song to playlist by order
const handleAddSong = (app) => {
  app.get("/producer/playlist/addsong/:playlistname/:songname/:index", async (req, res) => {
    const playlistname = req.params.playlistname;
    const songname = req.params.songname;
    const index = req.params.index;
    const findPlaylist = await Playlist.find({name:playlistname});
    const songlist = await Song.find({title: songname});
    const alreadyInPlaylist = [];
    for (let s of findPlaylist[0].songs) {
      if (s._id.toString() == songlist[0]._id.toString())
        alreadyInPlaylist.push(s);
    }
    if (findPlaylist.length == 0 || songlist.length == 0
      || alreadyInPlaylist.length > 0) {
      console.log('Invalid song name or playlist or already in the playlist!');
      res.redirect('/producer');
    } else {
      const addSong = {
        _id: songlist[0]._id.toString(),
        producer_created: true,
        dj_played: false
      };
      const playlistID = findPlaylist[0]._id.toString();
      Playlist.findOneAndUpdate({_id: playlistID}, 
        {$push: {songs: {$each: [addSong], $position: (parseInt(index))}}}, 
        {new: true})
        .then(async newPlaylist => {
          console.log('Update success!');
          songs = [];
          const foundSongs = await Song.find();
          for (let s of foundSongs) {
            for (let i = 0; i < newPlaylist.songs.length; i++) {
              if (s._id.toString() == newPlaylist.songs[i]._id.toString()) {
                songs.splice(i, 0, s);
                i++;
              }
            }
          }
          res.render(join(__dirname, "../views/Producer/pages/index"), {
            djName: djName,
            djs: djs,
            days: days,
            podcasts: podcasts,
            songs: songs,
            userHandler: "user();",
          });
        })
        .catch(err => {
          console.log(`Failed! ${err}`);
        })
    }
  });
}

// re-displays list of all songs
const handleReset = (app) => {
  app.get("/producer/reset", async (req, res) => {
    djName = "Select DJ";
    songs = [];
    const allSongs = await Song.find();
    allSongs.forEach(s => songs.push(s));
    res.render(join(__dirname, "../views/Producer/pages/index"), {
      djName: djName,
      djs: djs,
      //playlists: playlists,
      days: days,
      podcasts: podcasts,
      songs: songs,
      userHandler: "user();",
    });
  });
}

// removes song from a playlist by songname
const handleRemoveSong = (app) => {
  app.get("/producer/playlist/removesong/:playlistname/:songname", async (req, res) => {
    const playlistname = req.params.playlistname;
    const songname = req.params.songname;
    const findPlaylist = await Playlist.find({name: playlistname});
    const songlist = await Song.find({title: songname});
    const alreadyInPlaylist = [];
    for(let s of findPlaylist[0].songs) {
      if(s._id.toString() == songlist[0]._id.toString()) {
        alreadyInPlaylist.push(s);
      }
    }
    if(findPlaylist.length == 0 || songlist.length == 0
      || alreadyInPlaylist.length == 0) {
      console.log('Invalid song name or playlist or not in the playlist!');
      res.redirect('/producer');
    } else {
      const playlistID = findPlaylist[0]._id.toString(); 
      const songId = songlist[0]._id.toString();
      Playlist.findOneAndUpdate({_id: playlistID}, {$pull:{songs:{_id: songId}}}, {new: true})
        .then(async newPlaylist => {
          console.log('Update success!');
          songs = [];
          const foundSongs = await Song.find();
          for (let s of foundSongs) {
            for (let i = 0; i < newPlaylist.songs.length; i++) {
              if (s._id.toString() == newPlaylist.songs[i]._id.toString()) {
                songs.splice(i, 0, s);
                i++;
              }
            }
          }
          res.render(join(__dirname, "../views/Producer/pages/index"), {
            djName: djName,
            djs: djs,
            days: days,
            podcasts: podcasts,
            songs: songs,
            userHandler: "user();",
          });
        })
        .catch(err => {
          console.log(`Failed! ${err}`);
        })
    }
  });
}

// search for a song
const handleSongSearch = (app) => {
  app.get("/producer/search/:song", async (req, res) => {
    songs = [];
    const songName = req.params.song;
    const foundSong = await Song.find({title: songName});
    if(foundSong.length == 0) {
      console.log('No such song!');
      res.redirect('/producer');
    }
    else {
      songs.push(foundSong[0]);
      res.render(join(__dirname, "../views/Producer/pages/index"), {
        djName: djName,
        djs: djs,
        days: days,
        podcasts: podcasts,
        songs: songs,
        userHandler: "user();",
      });
    }
  });
}

// displays dj playlist
const handleDJPlaylist = (app) => {
  app.get("/producer/playlist/:djname", async (req, res) => {
    songs = [];
    djSelected = true;
    djName = req.params.djname;
    const foundDJ = await Dj.find({ name: djName });
    const foundPlaylist = await Playlist.find();
    const foundSongs = await Song.find();
    const playlistbyDjId = foundPlaylist.find(p => p.dj == foundDJ[0]._id.toString());
    if (playlistbyDjId === undefined) {
      res.redirect('/producer');
    } else {
      for (let s of foundSongs) {
        for (let i = 0; i < playlistbyDjId.songs.length; i++) {
          if (s._id.toString() == playlistbyDjId.songs[i]._id.toString()) {
            songs.splice(i, 0, s);
            i++;
          }
        }
      }
      res.render(join(__dirname, "../views/Producer/pages/index"), {
        djName: djName,
        djs: djs,
        days: days,
        podcasts: podcasts,
        songs: songs,
        userHandler: "user();",
      });
    }
  });
}

export default {
  handleAll,
};