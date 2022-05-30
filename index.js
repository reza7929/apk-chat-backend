require("dotenv").config({ path: `./.env.${process.env.NODE_ENV}` });

const http = require("http"); // for http connection
const express = require("express"); // for transfer the data
const mongoose = require("mongoose");
const { getChatID } = require("./functions/getChatID");

const app = express();
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
    // socket.on("isOnLine", ({ name, room }, callBack) => {})

    const collection = db.collection("massages");
    const fromID = 1;
    const toID = 3;
    const chatID = getChatID(fromID, toID);

    // Create function to send status
    sendStatus = (value) => {
      socket.emit("status", value);
    };

    const res = await collection.findOne({ chatID });
    socket.emit("allMassages", res?.details);

    // Handle input events
    socket.on("sendMessage", async (data) => {
      const text = data.massage;

      // Check for name and massage
      if (!text) return sendStatus("فیلد ارسالی نمیتواند خالی باشد");
      // const collection = db.collection("massages");

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
      const options = { upsert: true, new: true, setDefaultsOnInsert: true };
      await collection.findOneAndUpdate(query, update, options);
      io.emit("allMassages", [{ fromID, text, time }]);
    });

    // Handle clear
    socket.on("clear", (data) => {
      // Remove all chats from collection
      chat.remove({}, () => {
        // Emit cleared
        socket.emit("اطلاعات چت پاک شد");
      });
    });
  });
});

const PORT = process.env.PORT || 5000;

server.listen(PORT, () => console.log(`Server is connected on Port ${PORT}`));
