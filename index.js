import express from "express";
import managerRouter from "./scripts/manager-router.js";
import producerRouter from "./scripts/producer-router.js";
import djRouter from "./scripts/dj-router.js"; 
import { fileURLToPath } from "url";
import { dirname, join } from "path";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();

app.set("views", "./views");
app.set("view engine", "ejs");

// Serve static files from the public directory. 
app.use('/static', express.static(join(__dirname, "public")));

managerRouter.handleAll(app);
producerRouter.handleAll(app);
djRouter.handleAll(app);

app.get("/", (_req, res) => {
  res.sendFile("views/Home/index.html");
});

const LISTEN_PORT = process.env.RADIO_STATION_LISTEN_PORT || 8080;
app.listen(LISTEN_PORT, () => {
  console.log(`Server is running on port ${LISTEN_PORT}`);
});
