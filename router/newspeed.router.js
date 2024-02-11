import express from "express";
import { prisma } from "../index.js";
import authMiddleware from "../middlewares/auth.middlewares.js";

const router = express.Router();

router.get("/newspeed", authMiddleware, async (req, res, next) => {
  const user = req.user;
  const { user1Id } = req.params;
  const friendships = await prisma.friendship.findMany({
    where: {
      OR: [{ user1Id: user1Id }, { user2Id: user.userId }],
      status: "friend",
    },
  });

  const friendIds = friendships.map((friendship) =>
    friendship.user2Id === user.userId ? friendship.user1Id : friendship.user2Id
  );

  const findfriend = await prisma.posts.findMany({
    where: {
      userId: { in: friendIds },
    },
    include: {
      user: {
        select: {
          name: true,
          profileUrl: true,
        },
      },
      comments: {
        select: {
          commentId: true,
          content: true,
          user: {
            select: {
              name: true,
              profileUrl: true,
            },
          },
        },
      },
    },
  });
  return res.render("newspeed", { findfriend });
});

export default router;
