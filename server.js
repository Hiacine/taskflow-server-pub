const app = require("./app");

const port = 3000;

app.get("/", (req, res, next) => {
  res.send("Hello hiacine");
  next();
});

app.get("/me", (req, res, next) => {
  res.send("GET /me → profil utilisateur courant");
  next();
});

app.post("/test", (req, res, next) => {
  res.send("GET /test");
  next();
});


if (process.env.NODE_ENV !== 'production'){
app.listen(port, () => {});
}

module.exports = (req, res) => app(req, res); // ou module.exports = app;