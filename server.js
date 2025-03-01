const express = require("express");
const bodyParser = require("body-parser");
const { Client } = require("pg");
const Docker = require("dockerode");
require("dotenv").config();

const app = express();
const docker = new Docker();
app.use(bodyParser.json());

const db = new Client({
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  database: process.env.DB_NAME,
  password: process.env.DB_PASSWORD,
  port: 5432,
});
db.connect();

// Webhook route to trigger builds
app.post("/webhook", async (req, res) => {
  const { repository } = req.body;
  if (!repository) return res.status(400).send("Invalid webhook");

  try {
    // Start a Docker container to build
    const container = await docker.createContainer({
      Image: "node:18",
      Cmd: ["sh", "-c", "npm install && npm test"],
      Tty: false,
    });

    await container.start();
    res.send("Build started...");
  } catch (err) {
    console.error("Build error:", err);
    res.status(500).send("Build failed");
  }
});

app.listen(3000, () => console.log("CI/CD API running on port 3000"));
