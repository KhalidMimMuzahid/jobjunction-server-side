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

//  socket io start here
const server = app.listen(port, () => {
  console.log("listening on port", port);
});
const io = require("socket.io")(server, {
  pingTimeout: 60000,
  cors: {
    origin: "http://localhost:3000",
  },
});
io.on("connection", (socket) => {
  console.log("connected to socket.io");
  socket.on("setup", (userData) => {
    // console.log("data: ", userData);
    socket.join(userData?.email);
    // console.log("try", userData?.email);
    socket.emit("connected");
  });
  socket.on("join chat", (room) => {
    socket.join(room);
    console.log("user joined room: ", room);
  });
});
//  socket io end here
// collection
const usersAdditionalInfo = client
  .db("UsersInfo")
  .collection("usersAdditionalInfo");
const users = client.db("UsersInfo").collection("users");
const timeLinePostsCollection = client.db("posts").collection("timeLinePosts");
const jobPostsCollection = client.db("posts").collection("jobPosts");
const chats = client.db("messaging").collection("chats");
const messages = client.db("messaging").collection("chats");

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
    // console.log(error.name.bgRed, error.message.bold);
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
    // console.log(error.name.bgRed, error.message.bold);
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

    res.send({
      success: true,
      message: "Successfully got the data",
      data: option,
    })
  } catch (error) {
    // catch block
    // console.log(error.name.bgRed, error.message.bold);
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


// update user details
app.put('/updateprofile', async (req, res) => {
  try {
    const data = req.body
    console.log("udatedata", data)
    const { profilePhoto, title, phone, location, coverImgLink, name, email, city } = req.body
    console.log("city", city)
    const filter = { email: email };
    const option = { upsert: false };
    const updateDoc = {
      $set: {
        profilePhoto,
        title,
        phone,
        location,
        coverImgLink, 
        name,
        email,
        city: city

    }
  }
    const result = await users.updateOne(filter, updateDoc, option);
   if(result){
    res.send({
      success: true,
      data: result
    })
   }else{
    res.send({
      success: false,
      message: 'could not found data'
    })
   }
  } catch (error) {
    res.send({
      success: false,
      error: error.message,
    });
  }
})






// liking api
// app.get('/like', async (req, res) => {
//   try {
//     const id = req.query.id
//     // const email = req.headers.email
//     const query = { _id: new ObjectId(id) }
//     const data = await timeLinePostsCollection.find(query).toArray()
//     // const result = data[0].allLikes
//     // console.log(result)
//     // console.log(data)
//     res.send(data)

//   } catch (error) {
//     console.log(error.name.bgRed, error.message.bold);
//     res.send({
//       success: false,
//       error: error.message,
//     });
//   }
// })

// find a job by filter
app.get("/search", async (req, res) => {
  try {
    const info = req.headers.data;
    const query = {};
    const parsedInfo = JSON.parse(info);
    console.log(parsedInfo);

    if (parsedInfo.searchType == "Jobs") {
      const result = await jobPostsCollection.find(query).toArray();
      // console.log("result", result);
      res.send({
        success: true,
        message: "Successfully got the data",
        data: result,
      });
    } else {
      const result = await users.find(query).toArray();
      console.log(result);
      res.send({
        success: true,
        message: "Successfully got the data",
        data: result,
      });
    }
  } catch (error) {
    // console.log(error.name.bgRed, error.message.bold);
    // res.send({
    //   success: false,
    //   error: error.message,
    // });
  }
});

// search people get api
app.get("/searchpeople", async (req, res) => {
  try {
    const _id = req.query._id;
    // const email = req.headers.email
    const query = { _id: new ObjectId(_id) };
    const data = await users.findOne(query);
    res.send(data);
  } catch (error) {
    // console.log(error.name.bgRed, error.message.bold);
    res.send({
      success: false,
      error: error.message,
    });
  }
});

// myprofile get api
app.get("/myprofile", async (req, res) => {
  try {
    const uid = req.query.uid;
    // const email = req.headers.email
    const query = { uid };
    const data = await users.findOne(query);
    res.send(data);
  } catch (error) {
    // console.log(error.name.bgRed, error.message.bold);
    res.send({
      success: false,
      error: error.message,
    });
  }
})

// add connection API PUT
app.put("/addconnecion", async (req, res) => {
  try {
    const connectionInfo = req.body;
    const { senderaInfo, receiverEmail } = connectionInfo;
    console.log(connectionInfo);

    const result = await users.updateOne(
      { email: receiverEmail },
      { $push: { pendingReq: senderaInfo } }
    );
    // console.log(result);
    res.send(result);
  } catch (error) {
    // console.log(error.name.bgRed, error.message.bold);
    res.send({
      success: false,
      error: error.message,
    });
  }
});


// cancel connection  put api
app.put("/caancelconnection", async (req, res) => {
  const infoString = req.headers.info;
  const info = JSON.parse(infoString);
  const { recieverEmail, senderEmail } = info;
  // console.log("cancel con info: ", info);
  const result = await users.updateOne(
    { email: recieverEmail },
    { $pull: { pendingReq: { senderEmail: senderEmail } } }
  );
  res.send(result);
});


// when user cancel the network connectuion
app.put("/acceptconnection", async (req, res) => {
  const infoString = req.headers.info;
  const info = JSON.parse(infoString);
  console.log(info);
  // return;
  const { recieverInfo, senderInfo } = info;

  // console.log("cancel con info: ", info);
  const result = await users.updateOne(
    { email: recieverInfo?.recieverEmail },
    { $pull: { pendingReq: { senderEmail: senderInfo?.senderEmail } } }
  );

  if (result?.modifiedCount) {
    const friendInfo = {
      friendName: senderInfo?.senderName,
      friendEmail: senderInfo?.senderEmail,
      friendPhoto: senderInfo?.senderPhoto,
    };
    const result1 = await users.updateOne(
      { email: recieverInfo?.recieverEmail },
      { $push: { allFriends: friendInfo } }
    );
    if (result1?.modifiedCount) {
      const friendInfo = {
        friendName: recieverInfo?.recieverName,
        friendEmail: recieverInfo?.recieverEmail,
        friendPhoto: recieverInfo?.recieverPhoto,
      };
      const result2 = await users.updateOne(
        { email: senderInfo?.senderEmail },
        { $push: { allFriends: friendInfo } }
      );
      return res.send(result2);
    }
  } else {
    return res.send({
      success: false,
      error: "something went wrong.",
    });
  }
});


// like api put
app.put('/likeapost', async (req, res) => {
  try {
    const infoString = req.headers.info;
    const info = JSON.parse(infoString)
    const { _id, email } = info
    console.log("id", _id, "mail",email)

  const result = await timeLinePostsCollection.updateOne(
    {_id : new ObjectId(_id)},
    { $push: { allLikes: email}}
    )
    console.log(result)

    // const query = {}
    res.send({
      success: true,
      message: "Successfully got the data",
      data: result,
    });


  } catch (error) {
    res.send({
      success: false,
      error: error.message,
    });
  }
})


// likes-of-a-post get api
// app.get('/likes-of-a-post', async(req, res) => {
//   try {
//     const infoString = req.headers.info;
//     const info = JSON.parse(infoString)
//     const { _id, email } = info

//   } catch (error) {
    
//   }
// })


// dislike a post put api
app.put('/dislikeapost', async (req, res) => {
  try {
    const infoString = req.headers.info;
    const info = JSON.parse(infoString)
    const { _id, email } = info
    console.log("id", _id, "mail", email)

    const result = await timeLinePostsCollection.updateOne(
      { _id: new ObjectId(_id) },
      { $pull: { allLikes: email } }
    )
    console.log(result)

    // const query = {}
    res.send({
      success: true,
      message: "Successfully got the data",
      data: result,
    });


  } catch (error) {
    res.send({
      success: false,
      error: error.message,
    });
  }
})