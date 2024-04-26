import express from "express";
import managerRouter from "./scripts/manager-router.js";
import producerRouter from "./scripts/producer-router.js";
import djRouter from "./scripts/dj-router.js";
import { fileURLToPath } from "url";
import { dirname, join } from "path";
import bodyParser from "body-parser";
import dotenv from "dotenv";
import mongoose from "mongoose";
import session from "express-session"; 

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();

// Add the session middleware here
app.use(session( {
    secret: 'could be anything',
    resave: false,
    saveUninitialized: true
}));

// Connect to databse
const mongooseClientOptions = {
  serverApi: { version: "1", strict: true, deprecationErrors: true },
  dbName: 'RadioStation'
};
await mongoose.connect(process.env.MONGO_URL, mongooseClientOptions);
await mongoose.connection.db.admin().command({ ping: 1 });
console.log("Connected to MongoDB");

// Set EJS
app.set("views", "./views");
app.set("view engine", "ejs");

// Serve static files from the public directory.
app.use("/static", express.static(join(__dirname, "public")));

// Used to get data from ejs.
app.use(express.urlencoded({ extended: true }));
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

// Handle all of the routing.
managerRouter.handleAll(app);
producerRouter.handleAll(app);
djRouter.handleAll(app);

// Load home page
app.get("/", (_req, res) => {
  res.sendFile(join(__dirname, "public/Home/index.html"));
});

const LISTEN_PORT = process.env.RADIO_STATION_LISTEN_PORT || 8080;
app.listen(LISTEN_PORT, () => {
  console.log(`Server is running on port ${LISTEN_PORT}`);
});