import express from "express";
import { prisma } from "../index.js";
import authMiddleware from "../middlewares/auth.middlewares.js";

const router = express.Router();

router.get("/newspeed", authMiddleware, async (req, res, next) => {
  const { user, userId } = req.user;
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

  const nofriend = await prisma.friendship.findMany({
    where: [
      {
        OR: [{ user1Id: user1Id }, { user2Id: user.userId }],
      },
      {
        NOT: {
          status: "friend",
        },
      },
    ],
    select: {
      user1Id: true,
      user2Id: true,
    },
  });
  const nofriendIds = nofriendships.map((friendship) =>
    friendship.user2Id === user.userId ? friendship.user1Id : friendship.user2Id
  );

  return res.render("newspeed", { nofriendIds });
});

router.get("/newspeed/my", authMiddleware, async (req, res, next) => {
  const { userId } = req.user;
  const post = await prisma.posts.findMany({
    where: { userId: +userId },
    include: {
      user: {
        select: {
          name: true,
          profileUrl: true,
        },
      },
    },
  });
  return res.json({ data: post });
});

export default router;
