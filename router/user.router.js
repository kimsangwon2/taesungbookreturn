import express from "express";
import { prisma } from "../models/index.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import authMiddleware from "../middlewares/auth.middlewares.js";
import { Prisma } from "@prisma/client";
import axios from "axios";
import { sendVerificationEmail } from "../middlewares/sendEmail.middlewares.js";
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

router.post("/sign-up", async (req, res, next) => {
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

    await sendVerificationEmail(email, token.toString()); // 난수 인증 코드를 이메일로 보냅니다.

    return res.status(201).json({
      message: "회원가입이 완료되었습니다. 이메일 인증 메일을 확인해주세요.",
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "회원가입에 실패했습니다." });
  }
});

export default router;
