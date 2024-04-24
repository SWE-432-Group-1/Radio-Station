import { dirname, join } from 'path';
import { fileURLToPath } from 'url';
import { Dj, Song, Podcast } from '../models/schemas.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename)

const handleAll = (app) => {
  handleDefault(app);
};

const handleDefault = (app) => {
  app.get("/producer", async (_req, res) => {

    // ----------------------not really relevant to the project just for immersion and fun-----------------------------
    const days = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun", "1", "2", "3", "4", "5", "6", "7",
      "8", "9", "10", "11", "12", "13", "14", "15", "16", "17", "18", "19", "20", "21", "22",
      "23", "24", "25", "26", "27", "28", "29"];
    
    // gets the list of podcasts
    const podcasts = await Podcast.find();

    // ----------------------not really relevant to the project just for immersion and fun-----------------------------


    //------------------------------------------relevant to the project------------------------------------------------

    // gets the list of all songs
    const songs = await Song.find();

    // gets list of all djs
    const djs = await Dj.find();

    res.render(join(__dirname, "../views/Producer/pages/index"), {
      djList: djs,
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