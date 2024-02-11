import express from "express";
import { prisma } from "../index.js";
import authMiddleware from "../middlewares/auth.middlewares.js";

const router = express.Router();

//친구 요청

router.post("/friendship", authMiddleware, async (req, res, next) => {
  const { status, friendshipId } = req.params;
  const user = req.user;
  const { user1Id } = req.body;
  const user1 = await prisma.users.findUnique({
    where: { userId: +user1Id },
  });

  console.log(user1);

  if (!user1)
    return res.status(404).json({ message: "유저가 존재하지 않습니다." });

  const user2 = await prisma.users.findUnique({
    where: { userId: user.userId },
  });

  if (!user2)
    return res.status(404).json({ message: "로그인이 유효하지 않습니다." });

  const friend = await prisma.friendship.create({
    data: {
      friendshipId,
      user1Id: +user1Id,
      user2Id: user.userId,
      status,
    },
  });

  return res.status(201).json({ data: friend });
});

//친구 수락

router.put(
  "/friendship/:friendshipId",
  authMiddleware,
  async (req, res, next) => {
    const user = req.user;
    const { friendshipId } = req.params;
    const findfriend = await prisma.friendship.findFirst({
      where: {
        friendshipId: +friendshipId,
        user1Id: user.userId,
        status: "nofriend",
      },
    });
    if (!findfriend)
      return res
        .status(404)
        .json({ message: "친구 요청이 존재하지 않습니다." });
    const friend = await prisma.friendship.update({
      where: { friendshipId: +friendshipId },
      data: {
        status: "friend",
      },
    });
    return res.status(201).json({ message: "친구를 수락하였습니다" });
  }
);

//친구 정보
//친구의 아이디(user1Id)와 이름(user.name)이 조회
router.get("/friendship/my", authMiddleware, async (req, res, next) => {
  const user = req.user;

  const friend = await prisma.friendship.findMany({
    where: {
      OR: [
        {
          user1Id: user.userId,
          status: "friend",
        },
        {
          user2Id: user.userId,
          status: "friend",
        },
      ],
    },
    include: {
      user1: {
        select: {
          userId: true,
          name: true,
        },
      },
    },
  });
  return res.status(200).json({ friend });
});

//친구 삭제
//친구의 상태(status)를 친구였던것(nofriend)으로 보내면 친구 삭제
router.delete(
  "/friendship/delete/:friendshipId",
  authMiddleware,
  async (req, res, next) => {
    const user = req.user;
    const { friendshipId } = req.params;
    const findfriend = await prisma.friendship.findFirst({
      where: {
        OR: [
          {
            friendshipId: +friendshipId,
            status: "friend",
            user1Id: user.userId,
          },
          {
            friendshipId: +friendshipId,
            status: "friend",
            user2Id: user.userId,
          },
        ],
      },
    });
    if (!findfriend)
      return res.status(404).json({ message: "친구가 존재하지 않습니다" });
    const friend = await prisma.friendship.delete({
      where: { friendshipId: +friendshipId },
    });
    return res.status(200).json({ message: "친구 삭제를 성공하였습니다" });
  }
);

export default router;
