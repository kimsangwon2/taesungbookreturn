import { S3Client } from "@aws-sdk/client-s3";
import { Upload } from "@aws-sdk/lib-storage";
import multer from "multer";
import { tmpdir } from "os";
import dotenv from "dotenv";
import fs from "fs";

dotenv.config();

const s3 = new S3Client({
  region: process.env.REGION,
  credentials: {
    accessKeyId: process.env.ACCESS_KEY,
    secretAccessKey: process.env.SECRET_ACCESS_KEY,
  },
});

const multerUpload = multer({
  dest: tmpdir(),
});

const upload = async (req, res, next) => {
  return new Promise((resolve, reject) => {
    multerUpload.single("profileimage")(req, res, async (error) => {
      if (error) {
        reject(res.status(500).json({ message: error.message }));
      }
      console.log(req.file);
      const fileStream = fs.createReadStream(req.file.path);

      const uploader = new Upload({
        client: s3,
        params: {
          Bucket: process.env.BUCKET_NAME,
          Key: req.file.originalname,
          Body: fileStream,
          ContentType: req.file.mimetype,
        },
      });

      try {
        await uploader.done();
        resolve(next());
      } catch (error) {
        reject(res.status(500).json({ message: error.message }));
      }
    });
  });
};

export { upload };
