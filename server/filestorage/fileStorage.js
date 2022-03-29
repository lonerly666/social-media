const path = require("path");
const { GridFsStorage } = require("multer-gridfs-storage");
const mongoose = require("mongoose");
const Grid = require("gridfs-stream");

const mongoURI = process.env.DBURL;
let gfs;
const conn = mongoose.createConnection(mongoURI);
conn.once("open", () => {
  gfs = Grid(conn.db, mongoose.mongo);
  gfs.collection("uploads");
});

// Create storage engine
const storage = new GridFsStorage({
  url: mongoURI,
  file: async (req, file) => {
    return new Promise((resolve, reject) => {
      try {
        const filename = req.user._id + file.originalname;
        const fileInfo = {
          filename: filename,
          metadata: req.user._id,
          bucketName: "profile",
        };
        resolve(fileInfo);
      } catch (err) {
        reject(err);
      }
    });
  },
});

module.exports = storage;
