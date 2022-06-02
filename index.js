require("dotenv").config({ path: `./.env.${process.env.NODE_ENV}` });

const http = require("http"); // for http connection
const express = require("express"); // for transfer the data
const mongoose = require("mongoose");
const routes = require("./routes");
const cors = require("cors");
const bodyParser = require("body-parser");
const { getChatID } = require("./functions/getChatID");
const auth = require("./middleware/auth");

const app = express();
app.use(cors());
app.use(bodyParser.json());
const server = http.createServer(app);

const io = require("socket.io")(server, {
  cors: {
    origin: "http://localhost:3000",
    methods: ["GET", "POST"],
    allowedHeaders: ["my-custom-header"],
    credentials: true,
  },
});

mongoose.connect(process.env.DATABASE_URL, (err, db) => {
  if (err) return console.log(err);
  console.log("connected to db");

  io.on("connection", async (socket) => {
    const collection = db.collection("massages");
    const userCollection = db.collection("users");
    const handshakeData = await socket.request;
    const fromID = parseInt(handshakeData._query["fromID"]);

    await userCollection.findOneAndUpdate(
      { id: fromID },
      { $set: { isOnline: true } }
    );

    socket.on("allUsers", async () => {
      const res = await userCollection.find().toArray();
      io.emit("allUsersRes", res);
    });

    socket.on("allMassages", async (item) => {
      const chatID = getChatID(fromID, item.oppositID);
      const res = await collection.findOne({ chatID });
      io.emit(chatID, res?.details);
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
      await collection.findOneAndUpdate(query, update, options);
      socket.emit("sendMessageRes", [{ fromID, text, time }]);
    });

    socket.on("disconnect", async () => {
      await userCollection.findOneAndUpdate(
        { id: fromID },
        { $set: { isOnline: false } }
      );
      const res = await userCollection.find().toArray();
      io.emit("allUsersRes", res);
    });
  });
});

app.post("/auth", auth, (req, res) => {
  res.status(200).send();
});
app.use("/", routes);

const PORT = process.env.PORT || 5000;

server.listen(PORT, () => console.log(`Server is connected on Port ${PORT}`));
