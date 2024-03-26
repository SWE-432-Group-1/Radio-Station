const handleAll = (app) => {
    app.get("/manager", (_req, res) => {
        res.sendFile("views/Manager/manager.html");
    });
};

export default {
  handleAll,
};
