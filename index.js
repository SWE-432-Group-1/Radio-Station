import express from "express";
import managerRouter from "./scripts/manager-router.js";
import producerRouter from "./scripts/producer-router.js";
import djRouter from "./scripts/dj-router.js";
import { fileURLToPath } from "url";
import { dirname, join } from "path";
import bodyParser from 'body-parser';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();

app.set("views", "./views");
app.set("view engine", "ejs");

// Serve static files from the public directory. 
app.use('/static', express.static(join(__dirname, "public")));

// Used to get data from ejs. 
app.use(express.urlencoded({extended: true}));
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

// Handle all of the routing. 
managerRouter.handleAll(app);
producerRouter.handleAll(app);
djRouter.handleAll(app);

app.get("/", (_req, res) => {
  res.sendFile(join(__dirname, "views/Home/index.html"));
});

// Ejs for Producer
app.get("/Prod", (_req, res) => {
  const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun',
    '1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11', '12', '13', '14',
    '15', '16', '17', '18', '19', '20', '21', '22', '23', '24', '25', '26',
    '27', '28', '29']

  const podcasts = [
    { name: 'Good Podcast', episode: '9', duration: '1hr 30min' },
    { name: 'Bad Podcast', episode: '10', duration: '1hr' },
    { name: 'Okay Podcast', episode: '1', duration: '1hr 45min' },
    { name: 'Awesome Podcast', episode: '12', duration: '1hr 50min' },
    { name: 'Cool Podcast', episode: '5', duration: '1hr 30min' },
    { name: 'Cringe Podcast', episode: '7', duration: '1hr 35min' },
    { name: 'Boring Podcast', episode: '3', duration: '2hr' },
  ]

  const songs = [
    { name: 'Vibin', artist: 'Joe Smith' },
    { name: 'Back to back', artist: 'Jim Jones' },
    { name: 'Ghosted', artist: 'Polly Grace' },
    { name: 'Golden Dust', artist: 'Shiny' },
    { name: 'Whispers', artist: 'Paranoia' },
    { name: 'Our Galaxy', artist: 'Cosmos' },
    { name: 'Dreamy', artist: 'Andy A.' },
    { name: 'Vast Landscape', artist: 'Hustler' },
    { name: 'Night thoughts', artist: 'Y' },
  ]
  res.render(join(__dirname, "views/partials/Producer/pages/index"), { days: days, podcasts: podcasts, songs: songs });
});

const LISTEN_PORT = process.env.RADIO_STATION_LISTEN_PORT || 8080;
app.listen(LISTEN_PORT, () => {
  console.log(`Server is running on port ${LISTEN_PORT}`);
});
