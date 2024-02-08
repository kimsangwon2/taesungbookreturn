import express from "express";
import { prisma } from "../index.js";
import authMiddleware from "../middlewares/auth.middlewares.js";
const router = express.Router();

router.post("/friendship", authMiddleware, async (req, res, next) => {
  const { status, friendshipId } = req.params;
  const user = req.user;
  const { user1Id } = req.body;
  const user1 = await prisma.friendship.findFirst({
    where: { user1Id: +user1Id },
  });
  const user2 = await prisma.friendship.findFirst({
    where: { user2Id: user.userId },
  });
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
//친구 요청으로부터 온것을 상태(status) 친구(friend)로 보내주면 친구 수락
router.put("/user1Id/friendship", authMiddleware, async (req, res, next) => {
  const user = req.user;
  const { status, friendshipId } = req.params;
  const friend = await prisma.friendship.update({
    where: { friendshipId: +friendshipId },
    data: {
      status,
    },
  });
  return res.status(201).json({ message: "친구를 수락하였습니다" });
});

export default router;
