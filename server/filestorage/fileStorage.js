const { GridFsStorage } = require("multer-gridfs-storage");

const mongoURI = process.env.DBURL;

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
