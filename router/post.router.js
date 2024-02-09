import express from "express";
import { prisma } from "../index.js";
import authMiddleware from "../middlewares/auth.middlewares.js";
import { upload } from "../middlewares/upload.js";

const router = express.Router();

//모든 게시글 조회 api (여러건)
// router.get("/post", async (req, res) => {
//   const post = await prisma.posts.findMany({
//     include: {
//       user: {
//         select: {
//           name: true,
//         },
//       },
//     },
//   });

//   return res.json({ data: post });
// });

//게시글 상세 조회 (단건)
router.get("/post/:postId", async (req, res) => {
  const postId = req.params.postId;
  if (!postId) {
    return res.status(400).json({
      success: false,
      message: "포스트아이디값은 필수값입니다.",
    });
  }
  const posts = await prisma.posts.findFirst({
    where: {
      postId: +postId,
    },
    include: {
      user: {
        select: {
          name: true,
        },
      },
    },
  });

  if (!posts) {
    return res.status(404).json({ message: "게시글이 없습니다." });
  }

  return res.json({ data: posts });
});

//게시글 생성 api
router.post("/post", upload, authMiddleware, async (req, res) => {
  const user = req.user;
  const { title, content } = req.body;
  const profileimage = req.file;

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

  await prisma.posts.create({
    data: {
      title: title,
      content: content,
      userId: user.userId,
      profileUrl: profileimage.path,
    },
  });

  return res.status(201).json({ message: "게시글 등록이 완료되었습니다." });
});

//게시글 수정 api
router.put("/post/:postId", authMiddleware, async (req, res) => {
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

  if (!title) {
    return res.status(400).json({
      success: false,
      message: "이력서 제목은 필수값입니다.",
    });
  }

  if (!content) {
    return res.status(400).json({
      success: false,
      message: "이력서 내용은 필수값입니다.",
    });
  }

  const posts = await prisma.posts.findFirst({
    where: {
      postId: +postId,
    },
  });

  if (user !== user.userId) {
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

  return res.status(201).json({ data: updatedPost });
});

//게시글 삭제 api
router.delete("/post/:postId", authMiddleware, async (req, res) => {
  const user = req.user;
  const { postId } = req.params;

  if (user !== user.userId) {
    return res.status(400).json({
      success: false,
      message: "삭제 권한이 없습니다",
    });
  }

  await prisma.posts.delete({
    where: {
      postId: +postId,
    },
  });

  return res.status(201).json({ message: "게시글 삭제에 성공하셨습니다." });
});

export default router;
