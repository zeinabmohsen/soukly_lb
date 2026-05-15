const multer = require("multer");
const multerS3 = require("multer-s3");
const { S3Client } = require("@aws-sdk/client-s3");
const path = require("path");

const s3 = new S3Client({
  endpoint: process.env.SPACES_ENDPOINT,
  credentials: {
    accessKeyId: process.env.ACCESS_KEY_ID,
    secretAccessKey: process.env.SECRET_ACCESS_KEY,
  },
  region: process.env.SPACES_REGION,
});

// What we accept on /products/upload-image and /stores/me/store/upload-image.
// Videos are needed for store hero backgrounds; images for product/store photos.
const ALLOWED_MEDIA_MIMES = [
  // images
  "image/jpeg",
  "image/jpg",
  "image/png",
  "image/webp",
  "image/gif",
  // videos
  "video/mp4",
  "video/webm",
  "video/quicktime", // .mov
];

// 50 MB cap — covers a well-encoded 1080p hero video up to ~30 seconds.
// Bump if you need longer/higher-quality hero videos.
const MAX_UPLOAD_BYTES = 50 * 1024 * 1024;

let upload;
try {
  upload = multer({
    storage: multerS3({
      s3,
      bucket: process.env.SPACES_BUCKET_NAME,
      acl: "public-read",
      contentType: multerS3.AUTO_CONTENT_TYPE,
      key: (req, file, cb) => {
        try {
          const ext = path.extname(file.originalname);
          const basename = path.basename(file.originalname, ext);
          const filePath = `uploads/${basename}-${Date.now()}${ext}`;
          cb(null, filePath);
        } catch (error) {
          cb(error);
        }
      },
    }),
    limits: { fileSize: MAX_UPLOAD_BYTES },
    fileFilter: (req, file, cb) => {
      if (ALLOWED_MEDIA_MIMES.includes(file.mimetype)) {
        cb(null, true);
      } else {
        cb(
          new Error(
            `Unsupported file type "${file.mimetype}". Allowed: images (jpg/png/webp/gif) and videos (mp4/webm/mov).`
          ),
          false
        );
      }
    },
  });
} catch (error) {
  console.error("Error configuring multer:", error);
  throw error;
}

const uploadMiddleware = (req, res, next) => {
  try {
    upload.fields([
      { name: "file", maxCount: 1 },
      { name: "files", maxCount: 4 },
    ])(req, res, (err) => {
      if (err) {
        // Friendlier message for the common "File too large" multer error.
        const message = err.code === "LIMIT_FILE_SIZE"
          ? `File too large. Max size is ${Math.round(MAX_UPLOAD_BYTES / (1024 * 1024))}MB.`
          : err.message;
        return res.status(400).json({ success: false, error: message });
      }

      if (req.files?.file) {
        req.files = req.files.file;
      } else if (req.files?.files) {
        req.files = req.files.files;
      } else {
        req.files = [];
      }

      next();
    });
  } catch (error) {
    console.log("Error with the upload middleware: ", error);
    res.status(500).json({ success: false, error: "Internal server error" });
  }
};

const handleUpload = (req, res, next) => {
  try {
    if (!req.files || req.files.length === 0) {
      console.log("No files uploaded");
      return next();
    }

    req.files = req.files.map((file) => ({
      ...file,
      path: file.location,
    }));

    next();
  } catch (error) {
    console.log("Error handling upload: ", error);
    res.status(500).json({ success: false, error: "Internal server error" });
  }
};

module.exports = { uploadMiddleware, handleUpload };
