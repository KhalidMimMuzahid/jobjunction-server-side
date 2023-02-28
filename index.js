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
// console.log(uri);
const client = new MongoClient(uri);
// https://github.com/mdismail645221/ShopEase-assessment-sever/blob/main/index.js
const users = client.db("UsersInfo").collection("users");

// collection
const usersAdditionalInfo = client
  .db("UsersInfo")
  .collection("usersAdditionalInfo");
const timeLinePostsCollection = client.db("posts").collection("timeLinePosts");
const jobPostsCollection = client.db("alljobposts").collection("jobPosts");

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

// single post for timeline POST API
app.post("/usersinglepost", async (req, res) => {
  try {
    const postData = req.body;
    // console.log(body)
    const result = await timeLinePostsCollection.insertOne(postData);
    if (result.acknowledged) {
      res.send({
        success: true,
        message: "Successfully got the data",
        data: result,
      });
    } else {
      res.send({
        success: false,
        error: error.message,
      });
    }
  } catch (error) {
    console.log(error.name.bgRed, error.message.bold);
    res.send({
      success: false,
      error: error.message,
    });
  }
});

// all post GET API
app.get("/allposts", async (req, res) => {
  // try block
  try {
    const query = {};
    const option = await timeLinePostsCollection.find(query).toArray();
    res.send({
      success: true,
      message: "Successfully got the data",
      data: option,
    });
  } catch (error) {
    // catch block
    console.log(error.name.bgRed, error.message.bold);
    res.send({
      success: false,
      error: error.message,
    });
  }
});

// job POST API
app.post("/postajob", async (req, res) => {
  try {
    const postData = req.body;
    // console.log(body)
    const result = await jobPostsCollection.insertOne(postData);
    if (result.acknowledged) {
      res.send({
        success: true,
        message: "Successfully got the data",
        data: result,
      });
    } else {
      res.send({
        success: false,
        error: error.message,
      });
    }
  } catch (error) {
    console.log(error.name.bgRed, error.message.bold);
    res.send({
      success: false,
      error: error.message,
    });
  }
});

// all job post GET API
app.get("/getalljobs", async (req, res) => {
  // try block
  try {
    const query = {};
    const option = await jobPostsCollection.find(query).toArray();

    if (option.acknowledged) {
      res.send({
        success: true,
        message: "Successfully got the data",
        data: option,
      });
    } else {
      console.log(error.name.bgRed, error.message.bold);
      res.send({
        success: false,
        error: error.message,
      });
    }
  } catch (error) {
    // catch block
    console.log(error.name.bgRed, error.message.bold);
    res.send({
      success: false,
      error: error.message,
    });
  }
});

// user's data save POST API
app.post("/insertusertodb", async (req, res) => {
  try {
    const userInfo = req.body;
    console.log(userInfo);
    const result = await users.insertOne(userInfo);
    res.send(result);
  } catch {
    (error) => {
      console.log(error);
    };
  }
});


// liking api
app.get('/like', async (req, res) => {
  try {
    const id = req.query.id
    // const email = req.headers.email
    const query = { _id: new ObjectId(id) }
    const data = await timeLinePostsCollection.find(query).toArray()
    // const result = data[0].allLikes
    // console.log(result)
    // console.log(data)
    res.send(data)

  } catch (error) {
    console.log(error.name.bgRed, error.message.bold);
    res.send({
      success: false,
      error: error.message,
    });
  }
})

// find a job by filter
app.get("/searchjob", async (req, res) => {
  try {
    const info = req.headers.data;
    const query = {};
    console.log(JSON.parse(info));
    // const option = await jobPostsCollection.find(query).toArray();
    // res.send({
    //   success: true,
    //   message: "Successfully got the data",
    //   data: option,
    // });
    res.send(info);
  } catch (error) {
    console.log(error.name.bgRed, error.message.bold);
    // res.send({
    //   success: false,
    //   error: error.message,
    // });
  }
});

app.listen(port, () => {
  console.log("listening on port", port);
});
