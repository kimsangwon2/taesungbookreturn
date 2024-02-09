import express from "express";
import { prisma } from "../index.js";
import authMiddleware from "../middlewares/auth.middlewares.js";
const router = express.Router();

//게시글 좋아요 작성

router.post("/post/:postId/like", authMiddleware, async (req, res, next) => {
  const { userId } = req.user;
  const { postId } = req.params;
  const post = await prisma.posts.findFirst({
    where: { postId: +postId },
  });
  if (!post)
    return res.status(404).json({ message: "게시글이 존재하지 않습니다." });
  const user = await prisma.users.findFirst({
    where: { userId: +userId },
  });
  if (userId == post.userId)
    return res
      .status(403)
      .json({ message: "자신이 작성한 게시글에는 좋아요를 누를 수 없습니다." });
  //   const like = await prisma.likes.create({
  //     data: {
  //       userId: +userId,
  //       postId: +postId,
  //     },
  //   });
  const like = await prisma.likes.create({
    data: {
      user: {
        connect: {
          userId: +userId,
        },
      },
      post: {
        connect: {
          postId: +postId,
        },
      },
    },
  });
  return res.status(201).json({ message: "좋아요 성공!" });
});

//댓글 좋아요 작성

router.post(
  "/post/:postId/comment/:commentId/like",
  authMiddleware,
  async (req, res, next) => {
    const { userId } = req.user;
    const { postId, commentId } = req.params;
    const comment = await prisma.comments.findFirst({
      where: { commentId: +commentId },
    });
    if (!comment)
      return res.status(404).json({ message: "댓글이 존재하지 않습니다." });
    const user = await prisma.users.findFirst({
      where: { userId: +userId },
    });
    if (userId == comment.userId)
      return res
        .status(403)
        .json({ message: "자신이 작성한 댓글에는 좋아요를 누를 수 없습니다." });
    const like = await prisma.likes.create({
      data: {
        userId: +userId,
        postId: +postId,
        commentId: +commentId,
      },
    });
    return res.status(201).json({ message: "좋아요 성공!" });
  }
);

//좋아요 조회

router.get("/post/:postId/like", authMiddleware, async (req, res, next) => {
  const { postId } = req.params;
  const post = await prisma.posts.findFirst({
    where: { postId: +postId },
  });
  if (!post)
    return res.status(404).json({ message: "게시글이 존재하지 않습니다." });
  const like = await prisma.likes.findMany({
    where: { postId: +postId },
    orderBy: {
      createdAt: "desc",
    },
  });
  return res.status(200).json({ data: like });
});

//게시글 좋아요 삭제

router.delete(
  "/post/:postId/like/:likesId",
  authMiddleware,
  async (req, res, next) => {
    const { postId, likesId } = req.params;
    const { userId } = req.user;
    const likes = await prisma.likes.findFirst({
      where: { likesId: +likesId },
    });
    const post = await prisma.posts.findFirst({
      where: { postId: +postId },
    });
    if (!post)
      return res.status(404).json({ message: "게시글이 존재하지 않습니다." });
    if (likesId != likes.likesId)
      return res
        .status(404)
        .json({ message: "좋아요 누른 게시글인지 확인해주세요." });
    const comment = await prisma.comments.findFirst({});
    if (comment && likes.commentId)
      return res
        .status(404)
        .json({ message: "댓글 좋아요는 삭제할 수 없습니다." });
    if (userId != likes.userId)
      return res.status(403).json({ message: "좋아요를 누르지 않았습니다." });
    const like = await prisma.likes.delete({
      where: { likesId: +likesId },
    });
    return res.status(200).json({ message: "좋아요 삭제!" });
  }
);

// 댓글 좋아요 삭제

router.delete(
  "/post/:postId/comment/:commentId/like/:likesId",
  authMiddleware,
  async (req, res, next) => {
    const { commentId, likesId } = req.params;
    const { userId } = req.user;
    const comment = await prisma.comments.findFirst({
      where: {
        commentId: +commentId,
      },
    });
    if (!commentId)
      return res.status(404).json({ message: "댓글이 존재하지 않습니다." });
    const findlike = await prisma.likes.findFirst({
      where: {
        likesId: +likesId,
      },
    });
    if (likesId != findlike.likesId)
      return res
        .status(404)
        .json({ message: "좋아요 누른 댓글인지 확인해주세요." });
    if (userId != findlike.userId)
      return res.status(403).json({ message: "좋아요를 누르지 않았습니다." });
    const like = await prisma.likes.delete({
      where: { commentId: +commentId, likesId: +likesId },
    });

    return res.status(200).json({ message: "좋아요 삭제!" });
  }
);
export default router;
