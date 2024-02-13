import express from "express";
import { prisma } from "../index.js";
import authMiddleware from "../middlewares/auth.middlewares.js";
import { upload } from "../middlewares/upload.js";

const router = express.Router();

router.get("/post/list", async (req, res) => {
  const post = await prisma.posts.findMany({
    include: {
      user: {
        include: {},
      },
    },
  });
  return res.json({ data: post });
});

//게시글 생성 api
router.post("/post", upload, authMiddleware, async (req, res) => {
  const user = req.user;
  const { title, content, like } = req.body;

  if (!user) {
    return res.status(400).json({
      succuss: false,
      message: "유저 정보가 일치하지 않습니다.",
    });
  }

  if (!title) {
    return res.status(400).json({
      succuss: false,
      message: "게시글 제목은 필수값입니다.",
    });
  }

  if (!content) {
    return res.status(400).json({
      succuss: false,
      message: "게시글 내용은 필수값입니다.",
    });
  }

  let imageUrl = null;
  if (req.file) {
    imageUrl = req.file.Location;
  }

  await prisma.posts.create({
    data: {
      title: title,
      content: content,
      userId: user.userId,
      profileUrl: imageUrl,
      like: like,
    },
  });

  return res.redirect(req.headers.referer || "/");
});

//게시글 수정 api
router.post("/post/:postId", authMiddleware, async (req, res) => {
  const user = req.user;
  const { postId } = req.params;
  const { title, content, profileUrl } = req.body;

  // 유효성 검사
  if (!postId) {
    return res.status(400).json({
      success: false,
      message: "요청하신 게시물을 찾을 수 없습니다.",
    });
  }

  if (!user) {
    return res.status(400).json({
      success: false,
      message: "수정 권한이 없습니다",
    });
  }

  const updatedPost = await prisma.posts.update({
    where: {
      postId: +postId,
    },
    data: {
      title,
      content,
      profileUrl,
    },
  });

  return res.redirect(req.headers.referer || "/");
});

//게시글 삭제 api
router.delete("/post/:postId", authMiddleware, async (req, res) => {
  const user = req.user;
  const { postId } = req.params;

  if (!user) {
    return res.status(400).json({
      message: "삭제 권한이 없습니다",
    });
  }

  await prisma.posts.delete({
    where: {
      postId: +postId,
    },
  });

  return res.status(201).json({ message: "댓글 삭제에 성공하였습니다." });
});

export default router;
