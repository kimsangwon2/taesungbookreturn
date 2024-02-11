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
    secretAccessKey: process.env.SECRET_ACCESS_KEY, //S3Client 객체를 생성하고 S3에 접근하는데 사용
  },
});

const multerUpload = multer({
  dest: tmpdir(), //멀터 미들웨어를 설정하고 파일을 디렉토리에 저장
});

const upload = async (req, res, next) => {
  //업로드 함수를 정의
  return new Promise((resolve, reject) => {
    multerUpload.single("profileimage")(req, res, async (error) => {
      // 멀터.싱글을 요청해서 파일을 가져오고
      if (error) {
        reject(res.status(500).json({ message: error.message }));
      }
      console.log(req.file);
      const fileStream = fs.createReadStream(req.file.path); //파일을 읽는 스트림 생성

      const uploader = new Upload({
        // 파일을 S3에 업로드
        client: s3,
        params: {
          Bucket: process.env.BUCKET_NAME,
          Key: req.file.originalname,
          Body: fileStream,
          ContentType: req.file.mimetype,
        },
      });

      try {
        const result = await uploader.done();
        req.file.Location = result.Location; // S3에서 반환한 URL을 객체에 추가
        resolve(next());
      } catch (error) {
        reject(res.status(500).json({ message: error.message }));
      }
    });
  });
};

export { upload };
