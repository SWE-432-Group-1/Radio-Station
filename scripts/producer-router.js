import { dirname, join } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename)

const handleAll = (app) => {
  app.get("/producer", (_req, res) => {
    res.sendFile(join(__dirname, '../public/Producer/index.html'));
  });
};

export default {
  handleAll,
};