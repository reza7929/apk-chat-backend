require("dotenv").config({ path: `./.env.${process.env.NODE_ENV}` });

const http = require("http"); // for http connection
const express = require("express"); // for transfer the data
const mongoose = require("mongoose");
const routes = require("./routes");
const cors = require("cors");
const bodyParser = require("body-parser");
const { getChatID } = require("./functions/getChatID");

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
    const handshakeData = socket.request;
    const fromID = handshakeData._query["fromID"];
    const toID = handshakeData._query["toID"];
    const chatID = getChatID(fromID, toID);

    // if (parseInt(fromID)) {
    //   await userCollection.findOneAndUpdate(
    //     { id: 2 },
    //     {},
    //     {
    //       upsert: true,
    //       new: true,
    //       setDefaultsOnInsert: true,
    //     }
    //   );
    //   console.log({ fromID });
    // }
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
      const options = {
        upsert: true,
        new: true,
        setDefaultsOnInsert: true,
      };
      await collection.findOneAndUpdate(query, update, options);
      io.emit("allMassages", [{ fromID, text, time }]);
    });
  });
});

app.use("/", routes);

const PORT = process.env.PORT || 5000;

server.listen(PORT, () => console.log(`Server is connected on Port ${PORT}`));
