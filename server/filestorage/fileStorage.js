const path = require("path");
const { GridFsStorage } = require("multer-gridfs-storage");

const mongoURI = process.env.DBURL;

// Create storage engine
const storage = new GridFsStorage({
  url: mongoURI,
  file: (req, file) => {
    return new Promise((resolve, reject) => {
      try {
        const filename = req.user.nickname + path.extname(file.originalname);
        const fileInfo = {
          filename: filename,
          metadata: req.user._id,
          bucketName: "uploads",
        };
        resolve(fileInfo);
      } catch (err) {
        reject(err);
      }
    });
  },
});

module.exports = storage;
