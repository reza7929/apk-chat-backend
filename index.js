require("dotenv").config({ path: `./.env.${process.env.NODE_ENV}` });

const http = require("http"); // for http connection
const express = require("express"); // for transfer the data
const mongoose = require("mongoose");
const routes = require("./routes");
const cors = require("cors");
const bodyParser = require("body-parser");
const { getChatID } = require("./functions/getChatID");
const auth = require("./middleware/auth");

const app = express(); //for server requests
app.use(cors()); //for accept http connection
app.use(bodyParser.json()); //to get body value of requests
const server = http.createServer(app); //create server

const io = require("socket.io")(server, {
  cors: {
    origin: "http://localhost:3000",
    methods: ["GET", "POST"],
    allowedHeaders: ["my-custom-header"],
    credentials: true,
  },
});
//connect to the mongodb
mongoose.connect(process.env.DATABASE_URL, (err, db) => {
  if (err) return console.log(err);
  console.log("connected to db");
  //active socket io for user
  io.on("connection", async (socket) => {
    const collection = db.collection("massages");
    const userCollection = db.collection("users");
    //get id of the user who is active socket-io
    const handshakeData = await socket.request;
    const fromID = parseInt(handshakeData._query["fromID"]);
    //update user info in data base and set online for user
    await userCollection.findOneAndUpdate(
      { id: fromID },
      { $set: { isOnline: true } }
    );
    //active all user connection
    socket.on("allUsers", async () => {
      const res = await userCollection.find().toArray();
      //return users status to all active users
      io.emit("allUsersRes", res);
    });
    //active all massages connection
    socket.on("allMassages", async (item) => {
      const chatID = getChatID(fromID, item.oppositID);
      //join room witch is has unique id for each connection
      socket.join(chatID);
      // get previous massages from database
      const res = await collection.findOne({ chatID });
      //return previous massages to the user
      socket.emit("massagesRes", res?.details);
    });

    // Handle input events
    socket.on("sendMessage", async (data) => {
      const text = data.massage;
      // Check for name and massage
      if (!text) return sendStatus("فیلد ارسالی نمیتواند خالی باشد");
      // const collection = db.collection("massages");
      const chatID = getChatID(fromID, data.oppositID);
      // Insert massage
      const time = Date.now();
      const query = { chatID };
      const update = {
        $push: {
          details: {
            fromID,
            text,
            time,
          },
        },
      };
      const options = {
        upsert: true,
        new: true,
        setDefaultsOnInsert: true,
      };
      //save massage to database
      await collection.findOneAndUpdate(query, update, options);
      //return the massage to the room server and users can received that is connected to the room
      io.to(chatID).emit("massagesRes", [{ fromID, text, time }]);
    });
    //remove real-time connection for users who leaves the room
    socket.on("leaveRoom", (data) => {
      const chatID = getChatID(fromID, data.oppositID);
      //kickout user from room
      socket.leave(chatID);
    });
    //this will be run when user is disconnected the socket-io
    socket.on("disconnect", async () => {
      //set user status to offline
      await userCollection.findOneAndUpdate(
        { id: fromID },
        { $set: { isOnline: false } }
      );
      //get new info
      const res = await userCollection.find().toArray();
      //return new status of users
      io.emit("allUsersRes", res);
    });
  });
});
// check token
app.post("/auth", auth, (req, res) => {
  res.status(200).send();
});
//use route.js file
app.use("/", routes);
//check port on env file
const PORT = process.env.PORT || 5000;
//run server on custom port
server.listen(PORT, () => console.log(`Server is connected on Port ${PORT}`));
