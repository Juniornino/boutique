const multer = require('multer');
const path = require('path');
const fs = require('fs');

const uploadsParent = path.join(__dirname, '..', '..', 'public', 'uploads', 'products');
if (!fs.existsSync(uploadsParent)) {
  fs.mkdirSync(uploadsParent, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (_, __, cb) => cb(null, uploadsParent),
  filename: (req, file, cb) => {
    const mimeToExt = {
      'image/jpeg': '.jpg',
      'image/png': '.png',
      'image/webp': '.webp',
      'image/gif': '.gif',
    };
    const fromName = path.extname(file.originalname || '').toLowerCase();
    const safeExt =
      /\.(jpeg|jpg|png|webp|gif)$/.test(fromName) ? fromName : mimeToExt[file.mimetype] || '.png';
    cb(null, `${req.params.id}-${Date.now()}${safeExt}`);
  },
});

const allowed = new Set(['image/jpeg', 'image/png', 'image/webp', 'image/gif']);

const multerUploader = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (_, file, cb) => {
    if (!allowed.has(file.mimetype)) {
      cb(new Error("Format accepté : JPEG, PNG, WebP ou GIF."));
      return;
    }
    cb(null, true);
  },
}).single('image');

/** Multer erreurs → réponse JSON 400 */
function uploadProductImageMw(req, res, next) {
  multerUploader(req, res, (err) => {
    if (err) {
      const message =
        err.code === 'LIMIT_FILE_SIZE'
          ? 'Image trop volumineuse (maximum 5 Mo).'
          : err.message || 'Échec du téléversement.';
      return res.status(400).json({ success: false, message });
    }
    next();
  });
}

module.exports = { uploadProductImageMw };
