import express from "express";
import { prisma } from "../index.js";
import authMiddleware from "../middlewares/auth.middlewares.js";

const router = express.Router();

router.get("/newsfeed", authMiddleware, async (req, res, next) => {
  const user = req.user;
  const { user1Id } = req.params;
  const friendships = await prisma.friendship.findMany({
    where: {
      OR: [{ user1Id: user1Id }, { user2Id: user.userId }],
      status: "friend",
    },
  });

  const friendIds = friendships.map((friendship) =>
    friendship.user2Id === user.userId ? friendship.user2Id : friendship.user1Id
  );

  const findfriend = await prisma.posts.findMany({
    where: {
      userId: { in: friendIds },
    },
    include: {
      comments: {
        select: {
          commentId: true,
          content: true,
        },
      },
    },
  });
  return res.status(200).json({ data: findfriend });
});

export default router;
