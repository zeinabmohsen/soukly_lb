const multer = require("multer");
const {
  getOrCreateFolder,
  uploadBinaryFile,
  getRootFolderId,
} = require("../services/googleDrive");

const storage = multer.memoryStorage();
const upload = multer({ storage });

const folderCache = new Map();

async function ensureFolder(folderName) {
  if (folderCache.has(folderName)) return folderCache.get(folderName);
  const rootId = getRootFolderId();
  const folderId = await getOrCreateFolder({
    parentId: rootId,
    name: folderName,
  });
  folderCache.set(folderName, folderId);
  return folderId;
}

const createDriveUploadMiddleware = (folderName) => (req, res, next) => {
  upload.fields([
    { name: "file", maxCount: 1 },
    { name: "files", maxCount: 4 },
  ])(req, res, async (err) => {
    if (err) {
      return res.status(400).json({ success: false, error: err.message });
    }

    const files =
      req.files?.file ||
      req.files?.files ||
      [];

    if (!files.length) {
      req.files = [];
      return next();
    }

    try {
      const parentId = await ensureFolder(folderName);
      const resourceName = req.body?.name ? String(req.body.name).trim() : "resource";

      const uploaded = [];
      for (const file of files) {
        const safeName = `${resourceName}-${Date.now()}-${file.originalname}`;
        const result = await uploadBinaryFile({
          parentId,
          name: safeName,
          mimeType: file.mimetype,
          buffer: file.buffer,
          makePublic: true,
        });
        const resolvedUrl =
          result.publicUrl ||
          result.webContentLink ||
          result.webViewLink;
        uploaded.push({
          originalname: file.originalname,
          mimetype: file.mimetype,
          size: file.size,
          url: resolvedUrl,
          location: resolvedUrl,
          path: resolvedUrl,
          drive_file_id: result.id,
        });
      }

      req.files = uploaded;
      next();
    } catch (uploadError) {
      console.error("Drive upload failed:", uploadError.message);
      res.status(500).json({ success: false, error: "Drive upload failed" });
    }
  });
};

const driveUploadMiddleware = createDriveUploadMiddleware("Data Resources");

module.exports = { driveUploadMiddleware, createDriveUploadMiddleware };
