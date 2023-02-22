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
console.log(uri);
const client = new MongoClient(uri);
// https://github.com/mdismail645221/ShopEase-assessment-sever/blob/main/index.js
const users = client.db("UsersInfo").collection("users");
const usersAdditionalInfo = client
  .db("UsersInfo")
  .collection("usersAdditionalInfo");
const run = async () => {
  try {
    await client.connect((err) => {
      if (err) {
        console.log(`${err}`.red);
      } else {
        console.log("no error".bgBlue);
      }
    });
  } catch {
    (error) => {
      console.log(error);
    };
  }
};
run();

//  all api create below:
app.get("/", async (req, res) => {
  res.send({ message: "server is running" });
});

app.listen(port, () => {
  console.log("listening on port", port);
});
