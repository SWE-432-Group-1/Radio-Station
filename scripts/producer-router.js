import { dirname, join } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename)

const handleAll = (app) => {
  handleDefault(app);
};

const handleDefault = (app) => {
  app.get("/producer", (_req, res) => {
    const days = [
      "Mon","Tue","Wed","Thu","Fri","Sat","Sun","1","2","3","4","5","6","7",
      "8","9","10","11","12","13","14","15","16","17","18","19","20","21","22",
      "23","24","25","26","27","28","29"];

    const podcasts = [
      { name: "The Chill Podcast", episode: "9", duration: "1hr 30min" },
      { name: "Vibe Podcast", episode: "10", duration: "1hr" },
      { name: "Okay Podcast", episode: "1", duration: "1hr 45min" },
      { name: "Bookclub Podcast", episode: "12", duration: "1hr 50min" },
      { name: "Therapy Podcast", episode: "5", duration: "1hr 30min" },
      { name: "Gamers Podcast", episode: "7", duration: "1hr 35min" },
      { name: "Car Guys Podcast", episode: "3", duration: "2hr" },
    ];

    const songs = [
      { name: "Vibin", artist: "Joe Smith" },
      { name: "Back to back", artist: "Jim Jones" },
      { name: "Ghosted", artist: "Polly Grace" },
      { name: "Golden Dust", artist: "Shiny" },
      { name: "Whispers", artist: "Paranoia" },
      { name: "Our Galaxy", artist: "Cosmos" },
      { name: "Dreamy", artist: "Andy A." },
      { name: "Vast Landscape", artist: "Hustler" },
      { name: "Night thoughts", artist: "Y" },
      { name: "Laughin", artist: "JokesONU" },
      { name: "Never gonna", artist: "Adam" },
    ];
    res.render(join(__dirname, "../views/Producer/pages/index"), {
      days: days,
      podcasts: podcasts,
      songs: songs,
      podHandler: "podSearch();",
      djHandler: "djSearch();",
      userHandler: "user();",
    });
  });
}

export default {
  handleAll,
};