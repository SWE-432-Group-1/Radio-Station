import { dirname, join } from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const handleAll = (app) => {
    app.get("/manager", (_req, res) => {
        res.sendFile(join(__dirname, "../public/Manager/manager.html"));
    });
};

export default {
  handleAll,
};
