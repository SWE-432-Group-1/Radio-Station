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
  handleLogout(app);
};

// list of songs
var songs = [];

// tracks if current dropdown value is a dj name
let djSelected = false;

// name of the playlist
let playlistName = null;

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

    req.session.djSelected = djSelected;

    // default dropdown
    if (!req.session.djSelected) {
      req.session.djName = "Select DJ";
      djName = req.session.djName;
      req.session.playlistName = "List of songs";
      playlistName = req.session.playlistName;
    }

    // gets the list of podcasts
    req.session.podcasts = await Podcast.find();
    podcasts = req.session.podcasts;

    // gets the list of all songs
    const foundSongs = await Song.find();
    var temp = songs;
    if (temp.length == 0 && !req.session.djSelected) {
      foundSongs.forEach(s => temp.push(s));
      req.session.songs = temp;
      songs = req.session.songs;
    }

    // gets list of all djs
    req.session.djs = await Dj.find();
    djs = req.session.djs;

    // render page for the first time
    res.render(join(__dirname, "../views/Producer/pages/index"), {
      playlistName: playlistName,
      djName: djName,
      djs: djs,
      days: days,
      podcasts: podcasts,
      songs: songs,
    });
  });
}

// adds song to playlist by order (index)
const handleAddSong = (app) => {
  app.get("/producer/playlist/addsong/:playlistname/:songname/:index", async (req, res) => {
    // gets all the necessary parameters
    const playlistname = req.params.playlistname;
    const songname = req.params.songname;
    const index = req.params.index;
    const findPlaylist = await Playlist.find({name:playlistname});
    const songlist = await Song.find({title: songname});
    const alreadyInPlaylist = [];
    // looks to see if the song is already in the playlist
    for (let s of findPlaylist[0].songs) {
      if (s.song.toString() == songlist[0]._id.toString())
        alreadyInPlaylist.push(s);
    }
    if (findPlaylist.length == 0 || songlist.length == 0
      || alreadyInPlaylist.length > 0) {
      console.log('Invalid song name or playlist or already in the playlist!');
      res.redirect('/producer');
    } else {
      // add song to the playlist
      const addSong = {
        song: songlist[0]._id.toString(),
        producer_created: true,
        dj_played: false
      };
      const playlistID = findPlaylist[0]._id.toString();
      Playlist.findOneAndUpdate({_id: playlistID}, 
        {$push: {songs: {$each: [addSong], $position: (parseInt(index))}}}, 
        {new: true})
        .then(async newPlaylist => {
          req.session.songs = [];
          songs = req.session.songs;
          const foundSongs = await Song.find();
          var temp = [];
          for (let s of foundSongs) {
            for (let i = 0; i < newPlaylist.songs.length; i++) {
              if (s._id.toString() == newPlaylist.songs[i].song.toString())
                temp.splice(i, 0, s);
            }
          }
          req.session.songs = temp;
          songs = req.session.songs;
          // re-render the page
          res.render(join(__dirname, "../views/Producer/pages/index"), {
            playlistName: playlistName,
            djName: djName,
            djs: djs,
            days: days,
            podcasts: podcasts,
            songs: songs,
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
    // reset the page to show list of songs again
    req.session.playlistName = "List of songs";
    playlistName = req.session.playlistName;
    req.session.djName = "Select DJ";
    djName = req.session.djName;
    req.session.songs = [];
    songs = req.session.songs;
    const allSongs = await Song.find();
    var temp = []
    allSongs.forEach(s => temp.push(s));
    req.session.songs = temp;
    songs = req.session.songs;
    // re-render the page
    res.render(join(__dirname, "../views/Producer/pages/index"), {
      playlistName: playlistName,
      djName: djName,
      djs: djs,
      days: days,
      podcasts: podcasts,
      songs: songs,
    });
  });
}

// "logs out" or resets session of producer
const handleLogout = (app) => {
  app.get("/producer/logout", async (req, res) => {
    // cleanup current session
    req.session.destroy();
    res.redirect("/producer");
  });
}

// removes song from a playlist by song name
const handleRemoveSong = (app) => {
  app.get("/producer/playlist/removesong/:playlistname/:songname", async (req, res) => {
    // gets the necessary parameters
    const playlistname = req.params.playlistname;
    const songname = req.params.songname;
    const findPlaylist = await Playlist.find({name: playlistname});
    const songlist = await Song.find({title: songname});
    const alreadyInPlaylist = [];
    // check if the song actually in the playlist
    for(let s of findPlaylist[0].songs) {
      if(s.song.toString() == songlist[0]._id.toString())
        alreadyInPlaylist.push(s);
    }
    if(findPlaylist.length == 0 || songlist.length == 0
      || alreadyInPlaylist.length == 0) {
      console.log('Invalid song name or playlist or not in the playlist!');
      res.redirect('/producer');
    } else {
      // remove the song from the playlist
      const playlistID = findPlaylist[0]._id.toString(); 
      const songId = songlist[0]._id.toString();
      Playlist.findOneAndUpdate({_id: playlistID}, {$pull:{songs:{song: songId}}}, {new: true})
        .then(async newPlaylist => {
          req.session.songs = [];
          songs = req.session.songs;
          const foundSongs = await Song.find();
          var temp = []
          for (let s of foundSongs) {
            for (let i = 0; i < newPlaylist.songs.length; i++) {
              if (s._id.toString() == newPlaylist.songs[i].song.toString())
                temp.splice(i, 0, s);
            }
          }
          req.session.songs = temp;
          songs = req.session.songs;
          // re-render the page
          res.render(join(__dirname, "../views/Producer/pages/index"), {
            playlistName: playlistName,
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

// search for a song by song name
const handleSongSearch = (app) => {
  app.get("/producer/search/:song", async (req, res) => {
    req.session.songs = [];
    songs = req.session.songs;
    const songName = req.params.song;
    const foundSong = await Song.find({title: songName});
    // not found throw error
    if(foundSong.length == 0) {
      console.log('No such song!');
      res.redirect('/producer');
    }
    else {
      // song found, display it
      var temp = []
      temp.push(foundSong[0]);
      req.session.songs = temp;
      songs = req.session.songs;
      req.session.djSelected = true;
      djSelected = req.session.djSelected;
      req.session.playlistName = "Song found";
      playlistName = req.session.playlistName;
      // re-render page
      res.render(join(__dirname, "../views/Producer/pages/index"), {
        playlistName: playlistName,
        djName: djName,
        djs: djs,
        days: days,
        podcasts: podcasts,
        songs: songs,
      });
    }
  });
}

// displays dj playlist
const handleDJPlaylist = (app) => {
  app.get("/producer/playlist/:djname", async (req, res) => {
    // get necessary parameters
    req.session.songs = [];
    songs = req.session.songs;
    req.session.djSelected = true;
    djSelected = req.session.djSelected
    req.session.djName = req.params.djname;
    djName = req.session.djName;
    const foundDJ = await Dj.find({ name: djName });
    const foundPlaylist = await Playlist.find();
    const foundSongs = await Song.find();
    const playlistbyDjId = foundPlaylist.find(p => p.dj == foundDJ[0]._id.toString());
    // if no playlist for the dj found
    if (playlistbyDjId === undefined) {
      res.redirect('/producer');
    } else {
      // display all the songs of the found playlist for dj
      req.session.playlistName = playlistbyDjId.name;
      playlistName = req.session.playlistName;
      var temp = [];
      for (let s of foundSongs) {
        for (let i = 0; i < playlistbyDjId.songs.length; i++) {
          if (s._id.toString() == playlistbyDjId.songs[i].song.toString())
            temp.splice(i, 0, s);
        }
      }
      req.session.songs = temp;
      songs = req.session.songs;
      // re-render page
      res.render(join(__dirname, "../views/Producer/pages/index"), {
        playlistName: playlistName,
        djName: djName,
        djs: djs,
        days: days,
        podcasts: podcasts,
        songs: songs,
      });
    }
  });
}

export default {
  handleAll,
};