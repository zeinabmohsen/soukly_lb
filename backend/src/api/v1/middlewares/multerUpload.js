const multer = require("multer");
const path = require("path");
const fs = require("fs");

/**
 * Creates a multer middleware with custom upload directory and filter
 *
 * Behavior aligns with S3 upload middleware:
 * - Accepts either a single file under `file` OR multiple under `files`.
 * - Normalizes so controllers always get `req.files` as an array.
 * - If the request used the `file` field, sets `req.file`.
 * - If the request used the `files` field, NEVER sets `req.file`.
 *
 * @param {Object} options
 * @param {string} options.uploadDir - Path to upload folder (created if missing)
 * @param {string[]} options.allowedMimeTypes - List of allowed MIME types (optional)
 * @param {number} options.maxCount - Max files when using `files` field (default: 20)
 * @returns express middleware
 */
function createMulterUpload({
  uploadDir,
  allowedMimeTypes = [
    "image/jpeg",
    "image/png",
    "image/tiff",
    "image/tif",
    "application/pdf",
  ],
  maxCount = 20,
}) {
  try {
    // Ensure upload directory exists
    fs.mkdirSync(uploadDir, { recursive: true });

    const storage = multer.diskStorage({
      destination: (req, file, cb) => cb(null, uploadDir),
      filename: (req, file, cb) => {
        const ext = path.extname(file.originalname);
        const basename = path.basename(file.originalname, ext);
        cb(null, `${basename}-${Date.now()}${ext}`);
      },
    });

    const fileFilter = (req, file, cb) => {
      if (allowedMimeTypes.includes(file.mimetype)) {
        cb(null, true);
      } else {
        cb(
          new Error(
            `Only these file types are allowed: ${allowedMimeTypes.join(", ")}`
          ),
          false
        );
      }
    };

    const upload = multer({ storage, fileFilter });
    return (req, res, next) => {
      upload.fields([
        { name: "file", maxCount: 1 },
        { name: "files", maxCount },
      ])(req, res, (err) => {
        if (err) return next(err);

        const input = req.files || {};
        const single = Array.isArray(input.file) ? input.file : [];
        const multiple = Array.isArray(input.files) ? input.files : [];

        if (multiple.length > 0) {
          // 'files' stays as files (array). Do NOT set req.file.
          req.files = multiple;
          req.file = undefined;
        } else if (single.length > 0) {
          // 'file' stays as single file, but also provide array for controllers that expect `req.files`.
          req.file = single[0];
          req.files = single;
        } else {
          req.files = [];
          req.file = undefined;
        }

        next();
      });
    };
  } catch (error) {
    console.error("Error creating multer upload middleware:", error);
    throw error;
  }
}

module.exports = createMulterUpload;
