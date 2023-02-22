const express = require("express");
const cors = require("cors");
const jwt = require("jsonwebtoken");
require("dotenv").config();
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
const app = express();
const port = process.env.port || 5000;
app.use(cors());
app.use(express.json());
const user = process.env.DB_USER;
const password = process.env.DB_PASSWORD;
const uri = `mongodb+srv://${user}:${password}@cluster0.5e5ivqa.mongodb.net/?retryWrites=true&w=majority`;
const client = new MongoClient(uri);
async function run() {
  try {
    const users = client.db("UsersInfo").collection("users");
    const usersAdditionalInfo = client
      .db("UsersInfo")
      .collection("usersAdditionalInfo");
    //   https://github.com/mdismail645221/ShopEase-assessment-sever
    //   app.get("/", async (req, res) => {
    //   })
    //   app.get("/", async (req, res) => {
    //   })
    //   app.get("/", async (req, res) => {
    //   })
    //   app.get("/", async (req, res) => {
    //   })
    //   app.get("/", async (req, res) => {
    //   })
    //   app.get("/", async (req, res) => {
    //   })
  } finally {
  }
}
run().catch((error) => {
  res.send({});
});

app.listen(port, () => {
  console.log("listening on port", port);
});
