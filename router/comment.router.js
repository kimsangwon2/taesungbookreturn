import express from "express";
import { prisma } from "../index.js";
import authMiddleware from "../middlewares/auth.middlewares.js";
const router = express.Router();

//댓글  작성 API

router.post("/post/:postId/comment", authMiddleware, async (req, res, next) => {
  const { postId } = req.params;
  const { userId } = req.user;
  const { content } = req.body;
  const post = await prisma.posts.findFirst({
    where: {
      postId: +postId,
    },
  });
  if (!post)
    return res.status(404).json({ message: "게시글이 존재하지 않습니다." });
  const comment = await prisma.comments.create({
    data: {
      userId: +userId, // 댓글 작성자 ID
      postId: +postId, // 댓글 작성 게시글 ID
      content: content,
    },
  });
  return res.status(201).json({ message: "댓글 생성에 성공하였습니다." });
});

//댓글 조회API(여러건)

router.get("/post/:postId/comment", async (req, res, next) => {
  const { postId } = req.params;
  const post = await prisma.posts.findFirst({
    where: {
      postId: +postId,
    },
  });
  if (!post)
    return res.status(404).json({ message: "게시글이 존재하지 않습니다." });
  const comments = await prisma.comments.findMany({
    where: {
      postId: +postId,
    },
    include: {
      user: {
        select: {
          name: true,
          profileUrl: true,
        },
      },
    },
    orderBy: {
      createdAt: "asc",
    },
  });
  return res.status(200).json({ data: comments });
});

//댓글 수정 API

router.post(
  "/post/:postId/comment/:commentId",
  authMiddleware,
  async (req, res, next) => {
    const { content } = req.body;
    const { userId } = req.user;
    const { postId, commentId } = req.params;

    if (!postId) {
      return res.status(404).json({ message: "게시글이 없습니다." });
    }

    const putcomment = await prisma.comments.update({
      where: { commentId: +commentId },
      data: {
        userId: +userId,
        postId: +postId,
        content,
      },
    });
    return res.redirect(req.headers.referer || "/");
  }
);

//댓글 삭제 API

router.delete(
  "/post/:postId/comment/:commentId",
  authMiddleware,
  async (req, res, next) => {
    const { postId, commentId } = req.params;
    const { userId } = req.user;
    if (!postId) {
      return res.status(404).json({ message: "게시글이 없습니다." });
    }
    const user = await prisma.comments.findFirst({
      where: {
        userId: +userId,
      },
    });

    if (!user) {
      return res
        .status(404)
        .json({ message: "유저 정보가 유효하지 않습니다." });
    }
    const delcomment = await prisma.comments.delete({
      where: { commentId: +commentId },
    });
    return res.status(200).json({ message: "댓글 삭제에 성공하였습니다." });
  }
);

export default router;
