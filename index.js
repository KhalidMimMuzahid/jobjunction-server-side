const express = require("express");
const cors = require("cors");
const jwt = require("jsonwebtoken");
const moment = require("moment");
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

// const io = require("socket.io")(server, {
//   pingTimeout: 60000,
//   cors: {
//     origin: "https://job-junction-pro.web.app",
//   },
// });
// io.on("connection", (socket) => {
//   console.log("connected to socket.io");
//   // socket.on("setup", (userData) => {
//   //   console.log("data setup: ", userData);
//   //   socket.join(userData?.email);
//   //   // console.log("try", userData?.email);
//   //   socket.emit("connected");
//   // });
//   // socket.on("join chat", (room) => {
//   //   socket.join(room);
//   //   console.log("user joined room: ", room);
//   // });
//   socket.on("join chat", (userData) => {
//     socket.join(userData?.email);
//     console.log("user joined room: ", userData);
//   });
//   socket.on("new message", (messageDetailsInfo) => {
//     console.log("get message in socket io: ", messageDetailsInfo);
//     const { messageInfo, chatInfo } = messageDetailsInfo;
//     if (!chatInfo?.users) return console.log("chat.users not defined");
//     chatInfo?.users?.forEach((user) => {
//       if (user?.email == messageInfo?.senderEmail) {
//         return socket.in(user.email).emit("message sent");
//       }
//       socket.in(user.email).emit("message recieved", messageInfo);
//     });
//   });
//   socket.off("setup", () => {
//     console.log("USER DISCONNECTED");
//     socket.leave(userData?.email);
//   });
// });

//  socket io end here
// collection
const usersAdditionalInfo = client
  .db("UsersInfo")
  .collection("usersAdditionalInfo");
const users = client.db("UsersInfo").collection("users");
const timeLinePostsCollection = client.db("posts").collection("timeLinePosts");
const jobPostsCollection = client.db("posts").collection("jobPosts");
const chats = client.db("messaging").collection("chats");
const messages = client.db("messaging").collection("messages");

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
    console.log(postData);
    const result = await jobPostsCollection.insertOne(postData);
    console.log(result);
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

// all job post GET API
app.get("/jobs/:id", async (req, res) => {
  // try block
  try {
    const id = req.params.id;
    const query = { _id: new ObjectId(id) };
    const option = await jobPostsCollection.findOne(query);
    console.log(option);
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
app.put("/updateprofile", async (req, res) => {
  try {
    const data = req.body;
    console.log("udatedata", data);
    const {
      profilePhoto,
      title,
      phone,
      location,
      coverImgLink,
      name,
      email,
      city,
    } = req.body;
    console.log("city", city);
    const filter = { email: email };
    const option = { upsert: true };

    const updateDoc = {
      $set: {
        profilePhoto,
        title,
        phone,
        location,
        coverImgLink,
        name,
        email,
        city: city,
      },
    };
    const result = await users.updateOne(filter, updateDoc, option);
    if (result) {
      res.send({
        success: true,
        data: result,
      });
    } else {
      res.send({
        success: false,
        message: "could not found data",
      });
    }
  } catch (error) {
    res.send({
      success: false,
      error: error.message,
    });
  }
});

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
    // console.log(parsedInfo);

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
      // console.log(result);
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
    // console.log("xxxxxxxxx", data);
    res.send(data);
  } catch (error) {
    // console.log(error.name.bgRed, error.message.bold);
    res.send({
      success: false,
      error: error.message,
    });
  }
});
app.get("/userProfile", async (req, res) => {
  try {
    const email = req.query.email;
    // const email = req.headers.email
    const query = { email };
    const data = await users.findOne(query);
    // console.log("xxxxxxxxx", data);
    res.send(data);
  } catch (error) {
    // console.log(error.name.bgRed, error.message.bold);
    res.send({
      success: false,
      error: error.message,
    });
  }
});

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
  // console.log(info);
  const { recieverInfo, senderInfo } = info;
  // console.log("recieverInfo: ", recieverInfo, "\nsenderInfo: ", senderInfo);

  // return;
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

      const query = {
        isGroupChat: false,
        users: {
          $all: [
            { email: recieverInfo?.recieverEmail },
            { email: senderInfo?.senderEmail },
          ],
        },
      };

      const chatAlreadyExists = await chats.findOne(query);

      if (chatAlreadyExists) {
        return res.send(result2);
      } else {
        // return;
        const lastUpdatedAt = moment().format();

        const chat = {
          chatName: "",
          isGroupChat: false,
          chatProfilePhoto: "",
          users: [
            { email: recieverInfo?.recieverEmail },
            { email: senderInfo?.senderEmail },
          ],
          latestMessage: "you are Connected",
          groupAdmin: { email: "" },
          lastUpdatedAt: lastUpdatedAt,
        };
        // console.log(chat);
        const chatInsertResult = await chats.insertOne(chat);
        const chatObjectId = chatInsertResult?.insertedId?.toHexString();
        // console.log("xxsakcsdjcsdjcdjcsdjcjsd=>:::", chatInsertResult);
        // console.log("xxxxxxx:=>", chatInsertResult?.insertedId?.toHexString());

        if (chatObjectId) {
          const docs = [
            {
              chatId: chatObjectId,
              sender: { email: senderInfo?.senderEmail },
              message: `you have connected ${recieverInfo?.recieverName}`,
              readBy: [{ email: "" }],
            },

            {
              chatId: chatObjectId,
              sender: { email: recieverInfo?.recieverEmail },
              message: `you have connected ${senderInfo?.senderName}`,
              readBy: [{ email: "" }],
            },
          ];
          const result = await messages.insertMany(docs);
          return res.send(result);
        } else {
          return res.send(result2);
        }
      }
    } else {
      return res.send({
        success: false,
        error: "something went wrong.",
      });
    }
  } else {
    return res.send({
      success: false,
      error: "something went wrong.",
    });
  }
});

// like api put
app.put("/likeapost", async (req, res) => {
  try {
    const infoString = req.headers.info;
    const info = JSON.parse(infoString);
    const { _id, email } = info;
    console.log("id", _id, "mail", email);

    const result = await timeLinePostsCollection.updateOne(
      { _id: new ObjectId(_id) },
      { $push: { allLikes: email } }
    );
    console.log(result);

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
});

// comment API put
app.put("/comment", async (req, res) => {
  try {
    const infoString = req.headers.info;
    const commentInfo = JSON.parse(infoString);

    const { id } = commentInfo;
    // console.log(commentInfo)

    const query = { _id: new ObjectId(id) };
    const result = await timeLinePostsCollection.updateOne(query, {
      $push: { allComments: commentInfo },
    });

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
});

// comment API get
app.get("/comments", async (req, res) => {
  try {
    const id = req.query.id;
    // console.log(id)

    const query = { _id: new ObjectId(id) };

    const result = await timeLinePostsCollection.findOne(query);

    // console.log(result.allComments)

    res.send({
      success: true,
      message: "Successfully got the data",
      data: result.allComments,
    });
  } catch (error) {
    res.send({
      success: false,
      error: error.message,
    });
  }
});

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
app.put("/dislikeapost", async (req, res) => {
  try {
    const infoString = req.headers.info;
    const info = JSON.parse(infoString);
    const { _id, email } = info;
    console.log("id", _id, "mail", email);

    const result = await timeLinePostsCollection.updateOne(
      { _id: new ObjectId(_id) },
      { $pull: { allLikes: email } }
    );
    console.log(result);

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
});
app.get("/messagelists", async (req, res) => {
  const myEmail = req?.query?.myEmail;
  console.log("ny email", myEmail);

  const options = {
    sort: { lastUpdatedAt: -1 },
  };

  const query = {
    users: {
      $all: [{ email: myEmail }],
    },
  };

  const chatLists = await chats.find(query, options).toArray();
  // console.log(chatLists);
  res.send(chatLists);
});
app.get("/search-messages", async (req, res) => {
  console.log("hitted");
  const chatId = req.query.chatId;

  const query = { chatId };

  const allMessages = await messages.find(query).toArray();
  // console.log(allMessages);
  res.send(allMessages);
});
app.get("/chatInfo", async (req, res) => {
  // console.log("hitted");
  const chatId = req.query.chatId;

  const query = { _id: new ObjectId(chatId) };

  const chat = await chats.findOne(query);
  // console.log("chats: xxxxxxxx=> ", chat);
  res.send(chat);
});
app.post("/sendMessage", async (req, res) => {
  const messageInfo = req.body;
  const { chatId, message: textMessage, senderEmail } = messageInfo;
  console.log(messageInfo);

  const message = {
    chatId: chatId,
    sender: { email: senderEmail },
    message: textMessage,
    readBy: [{ email: "" }],
  };
  const result = await messages.insertOne(message);
  console.log("result: ", result);
  if (result.acknowledged) {
    const filter = { _id: new ObjectId(chatId) };
    // this option instructs the method to create a document if no documents match the filter
    const options = { upsert: false };
    // create a document that sets the plot of the movie
    const lastUpdatedAt = moment().format();
    const updateDoc = {
      $set: {
        latestMessage: textMessage,
        lastUpdatedAt: lastUpdatedAt,
      },
    };
    const result2 = await chats.updateOne(filter, updateDoc, options);
    return res.send(result2);
  } else {
  }
  res.send({ sdfs: "fgfd" });
});

// apply a job PUT API
app.put("/applyajob", async (req, res) => {
  try {
    const infoNeedParse = req.headers.info;
    const info = JSON.parse(infoNeedParse);
    const { _id, email } = info;

    // console.log(_id )
    // console.log(info)

    const query = { _id: new ObjectId(_id) };
    const option = await jobPostsCollection.updateOne(query, {
      $push: { totalApplyed: info },
    });

    res.send({
      success: true,
      message: "Successfully got the data",
      data: option,
    });
  } catch (error) {
    res.send({
      success: false,
      error: error.message,
    });
  }
});
// myprofile get api
app.get("/haveIJobPost", async (req, res) => {
  try {
    const userEmail = req?.query?.userEmail;
    // const email = req.headers.email
    const query = { userEmail };
    const data = await jobPostsCollection.find(query).toArray();
    // console.log("xxxxxxxxx", data);
    res.send(data);
  } catch (error) {
    // console.log(error.name.bgRed, error.message.bold);
    res.send({
      success: false,
      error: error.message,
    });
  }
});
