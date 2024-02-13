import express from "express";
import { prisma } from "../index.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import authMiddleware from "../middlewares/auth.middlewares.js";

const router = express.Router();

router.post("/sign-in", async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ message: "이메일과 비밀번호를 입력하세요." });
  }

  const user = await prisma.users.findFirst({ where: { email } });

  if (!user) {
    return res.status(401).json({ message: "존재하지 않는 이메일입니다." });
  }

  const passwordMatch = await bcrypt.compare(password, user.password);
  if (!passwordMatch) {
    return res.status(401).json({ message: "비밀번호가 일치하지 않습니다." });
  }

  const userJWT = jwt.sign(
    {
      userId: user.userId,
    },
    process.env.JWT_SECRET,
    { expiresIn: "12h" }
  );

  const refreshToken = jwt.sign(
    { userId: user.userId },
    process.env.REFRESH_SECRET,
    { expiresIn: "7d" }
  );
  console.log(user);
  res.cookie("authorization", `Bearer ${userJWT}`);
  res.cookie("refreshToken", refreshToken);
  return res.redirect("newspeed");
});

router.get("/logout", (req, res) => {
  res.clearCookie("authorization");
  res.clearCookie("refreshtoken");
  res.redirect("sign-in");
});

router.post("/refresh", async (req, res, next) => {
  const { refreshToken } = req.cookies;

  if (!refreshToken) {
    return res.status(401).json({ message: "리프레쉬 토큰이 없습니다." });
  }

  try {
    const { userId } = jwt.verify(refreshToken, process.env.REFRESH_SECRET);

    const newToken = jwt.sign({ userId: userId }, process.env.JWT_SECRET, {
      expiresIn: "12h",
    });

    res.cookie("authorization", `Bearer ${newToken}`);

    return res
      .status(200)
      .json({ message: "새로운 토큰 재발급에 성공했습니다." });
  } catch (error) {
    return res
      .status(401)
      .json({ message: "리프레시 토큰이 유효하지 않습니다." });
  }
});

router.get("/users", authMiddleware, async (req, res, next) => {
  const { userId } = req.user;

  const user = await prisma.users.findFirst({
    where: { userId: +userId },
    select: {
      userId: true,
      email: true,
      createdAt: true,
      updatedAt: true,
      permission: true,
    },
  });

  return res.status(200).json({ data: user });
});

router.put("/users/:userId", authMiddleware, async (req, res) => {
  const user = req.user;
  const { userId } = req.params;
  const { profileUrl } = req.body;

  if (!userId) {
    return res.status(400).json({
      success: false,
      message: "수정이 불가능한 유저입니다.",
    });
  }

  const profile = await prisma.users.findFirst({
    where: {
      userId: +userId,
    },
  });

  if (!profile) {
    return res.status(400).json({
      success: false,
      message: "존재하지 않는 유저 정보입니다",
    });
  }

  if (profile.userId !== user.userId) {
    return res.status(400).json({
      success: false,
      message: "올바르지 않은 요청입니다.",
    });
  }

  await prisma.users.update({
    where: {
      userId: +userId,
    },
    data: {
      profileUrl,
    },
  });

  return res.status(201).json({ message: "프로필 수정이 완료되었습니다." });
});

router.delete("/users/deleate", authMiddleware, async (req, res) => {
  const { userId } = req.user;

  await prisma.users.delete({
    where: {
      userId: +userId,
    },
  });

  return res.status(201).json({ message: "계정 삭제에 성공하셨습니다." });
});

router.get("/users/:userId", async (req, res) => {
  const userId = req.params.userId;

  const users = await prisma.users.findFirst({
    where: {
      userId: +userId,
    },
    select: {
      name: true,
      profileUrl: true,
      posts: {
        select: {
          user: true,
          title: true,
          content: true,
          comments: true,
          likes: {
            select: {
              likesId: true,
              userId: true,
              user: {
                select: {
                  name: true,
                },
              },
            },
          },
        },
      },
    },
  });

  return res.render("users", { user: users, posts: users.posts });
});

export default router;
