import multer from 'multer';

export const multerConfig = multer({
  storage: multer.diskStorage({}),

  fileFilter: (req, file, cb) => {
    console.log('in multerConfig fileFilter');

    // The function should call `cb` with a boolean
    // to indicate if the file should be accepted

    if (!file.mimetype.match(/png||jpeg||jpg||gif$i/)) {
      // You can always pass an error if something goes wrong:
      cb(new Error('File not supported'), false);
      return;
    }

    // To accept the file pass `true`, like so:
    cb(null, true);
  },
});

// Middleware for requests expecting multiple files
// Make generic: return the multerconfig.fields call and give upload paramters for maxCount and maybe name too.
// also I should make another one for single files.
// Also, they should both live in middleware
// export const multiUploader = multerConfig.fields([
//   { name: 'images', maxCount: 6 },
// ]);


