import express from "express";
import { prisma } from "../index.js";
import authMiddleware from "../middlewares/auth.middlewares.js";
const router = express.Router();

//게시글 좋아요 작성

router.post("/post/:postId/like", authMiddleware, async (req, res) => {
  const { postId } = req.params;
  const { userId } = req.user;

  try {
    const existingLike = await prisma.likes.findFirst({
      where: {
        postId: parseInt(postId),
        userId: userId,
        commentId: null,
      },
    });

    if (existingLike) {
      return res.status(400).json({ message: "이미 좋아요를 눌렀습니다." });
    }

    await prisma.likes.create({
      data: {
        postId: parseInt(postId),
        userId: userId,
        commentId: null,
      },
    });

    const updatedPost = await prisma.posts.update({
      where: { postId: parseInt(postId) },
      data: { like: { increment: 1 } },
    });

    res.status(200).json({ message: "좋아요 성공!", updatedPost });
  } catch (error) {
    res.status(500).json({ error: "좋아요 중 에러 발생" });
  }
});

//댓글 좋아요 작성

router.post("/comment/:commentId/like", authMiddleware, async (req, res) => {
  const { commentId } = req.params;
  const { userId } = req.user;
  try {
    const existingLike = await prisma.likes.findFirst({
      where: {
        commentId: parseInt(commentId),
        userId: userId,
        postId: null,
      },
    });

    if (existingLike) {
      return res.status(400).json({ message: "이미 좋아요를 눌렀습니다." });
    }

    await prisma.likes.create({
      data: {
        commentId: parseInt(commentId),
        userId: userId,
        postId: null,
      },
    });

    const updatedComment = await prisma.comments.update({
      where: { commentId: parseInt(commentId) },
      data: { clike: { increment: 1 } },
    });

    res.status(200).json({ message: "좋아요 성공!", updatedComment });
  } catch (error) {
    res.status(500).json({ error: "좋아요 중 에러 발생" });
  }
});

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
