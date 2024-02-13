import express from "express";
import { prisma } from "../index.js";
import bcrypt from "bcrypt";
import { Prisma } from "@prisma/client";
import { sendVerificationEmail } from "../middlewares/sendEmail.middlewares.js";
import { upload } from "../middlewares/upload.js";

const router = express.Router();

router.post("/ad/sign-up", async (req, res) => {
  try {
    const { email, password, Checkpass, name } = req.body;
    if (password.length < 6) {
      return res.status(409).json({
        message: "비밀번호가 6자 이상이어야 됩니다.",
      });
    }
    if (password !== Checkpass) {
      return res.status(409).json({
        message: "비밀번호 확인과 일치해야 합니다.",
      });
    }
    const isExistUser = await prisma.users.findFirst({
      where: {
        email,
      },
    });

    if (isExistUser) {
      return res.status(409).json({ message: "이미 존재하는 이메일입니다." });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const [user] = await prisma.$transaction(
      async (tx) => {
        const user = await tx.users.create({
          data: {
            email,
            password: hashedPassword,
            Checkpass: hashedPassword,
            name,
            permission: "Admin",
            emailstatus: "yes",
          },
        });
        return [user];
      },
      {
        isolationLevel: Prisma.TransactionIsolationLevel.ReadCommitted,
      }
    );

    return res.status(201).json({ message: "회원가입이 완료되었습니다." });
  } catch (err) {
    next(err);
  }
});
router.post("/sign-up", upload, async (req, res, next) => {
  try {
    const { email, password, Checkpass, name, emailstatus } = req.body;

    if (password.length < 6) {
      return res.status(409).json({
        message: "비밀번호가 6자 이상이어야 됩니다.",
      });
    }

    if (password !== Checkpass) {
      return res.status(409).json({
        message: "비밀번호 확인과 일치해야 합니다.",
      });
    }

    const isExistUser = await prisma.users.findFirst({
      where: {
        email,
      },
    });

    if (isExistUser) {
      return res.status(409).json({ message: "이미 존재하는 이메일입니다." });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const imageUrl = req.file.Location; // S3에 업로드된 이미지의 URL

    const [user] = await prisma.$transaction(
      async (tx) => {
        const token = Math.floor(Math.random() * 900000) + 100000;
        const user = await tx.users.create({
          data: {
            email,
            password: hashedPassword,
            Checkpass: hashedPassword,
            name,
            emailstatus: "nono", // 상태를 '가입대기중'으로 설정
            verificationToken: token.toString(), // token을 문자열로 변환하여 저장합니다.
            profileUrl: imageUrl, // S3에 업로드된 이미지의 URL을 저장합니다.
          },
        });

        await sendVerificationEmail(email, token.toString()); // 난수 인증 코드를 이메일로 보냅니다.
        return [user];
      },
      {
        isolationLevel: Prisma.TransactionIsolationLevel.ReadCommitted,
      }
    );
    const token = Math.floor(Math.random() * 900000) + 100000; // 6자리 숫자 난수 생성
    return res.redirect("/sign-token");
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "회원가입에 실패했습니다." });
  }
});

router.post("/sign-token", async (req, res, next) => {
  try {
    const { email, token } = req.body;

    const user = await prisma.users.findFirst({
      where: { email },
    });

    if (!user) {
      return res.status(404).json({ message: "유저를 찾을 수 없습니다." });
    }

    if (!user.verificationToken) {
      return res
        .status(400)
        .json({ message: "인증 코드가 일치하지 않습니다." });
    }

    await prisma.users.update({
      where: { userId: user.userId },
      data: { emailstatus: "yes" },
    });

    return res.redirect("/sign-in");
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "서버 에러" });
  }
});

export default router;
