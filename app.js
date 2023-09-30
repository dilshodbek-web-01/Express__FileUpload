import express from "express";
import fileUpload from "express-fileupload";
import path from "path";
import fs from "fs";
import cors from "cors";
import * as uuid from "uuid";
import config from "config";
const PORT = config.get("port") || 3000;

const app = express();
app.use(express.json());
app.use(cors());
app.use(fileUpload({ limits: { fileSize: 1024 * 1024 * 50 } }));
app.use("/images", express.static(path.join(process.cwd(), "images")));

app.get("/users", (req, res) => {
  res.send(
    fs.readFileSync(path.join(process.cwd(), "db", "data.json"), "utf-8")
  );
});

app.get("/register", (req, res) => {
  res.sendFile(path.join(process.cwd(), "views", "register.html"));
});

app.get("/index", (req, res) => {
  res.sendFile(path.join(process.cwd(), "views", "index.html"));
});

app.post("/register", (req, res) => {
  const { image } = req.files;
  const { username, password } = req.body;

  // const mimetype = path.extname(image.name);

  image.mv(path.join(process.cwd(), "images", image.name));

  const newUser = {
    id: uuid.v4(),
    imagePath: "/images/" + image.name,
    username,
    password,
  };

  const users = JSON.parse(
    fs.readFileSync(path.join(process.cwd(), "db", "data.json"), "utf-8")
  );

  users.push(newUser);

  fs.writeFileSync(
    path.join(process.cwd(), "db", "data.json"),
    JSON.stringify(users, null, 4)
  );

  res.send({ message: "ok" });
});

app.delete("/users/:name", (req, res) => {
  fs.unlinkSync(path.join(process.cwd(), "images", req.params.name));
  res.json({ message: "Deleted" });
});

app.listen(PORT, () => console.log("Server is running on the " + PORT));
