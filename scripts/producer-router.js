const handleAll = (app) => {
  app.get("/producer", (_req, res) => {
    res.sendFile("views/Producer/index.html");
  });
};

export default {
  handleAll,
};
