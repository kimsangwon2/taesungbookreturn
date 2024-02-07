import express from "express";
import { prisma } from "../index.js";

const router = express.Router();

// - [ ]  **댓글 CRUD 기능**
//     - 댓글 작성, 조회, 수정, 삭제 기능
//         - 사용자는 게시물에 댓글을 작성할 수 있고 본인의 댓글은 수정 및 삭제를 할 수 있어야 합니다.
//         - 또한, 게시물과 마찬가지로 댓글 조회를 제외한 나머지 기능들은 인가(Authorization)개념이 적용되어야 합니다.
//     - 댓글 작성, 수정, 삭제 시 새로고침 기능
//         - 프론트엔드에서 댓글 작성, 수정 및 삭제를 할 때마다 조회 API를 다시 호출하여 자연스럽게 최신의 댓글 목록을 화면에 보여줄 수 있도록 해야 합니다!

//댓글  생성 API
router.post("/comment", async (req, res, next) => {
  const { content } = req.body;
  const { userId } = req.user;
  const { postId } = req.post;
  const findpost = await prisma.commnet.findFirst({
    where: { postId: +postId },
  });
  if (!postId) {
    return res.status(404).json({ message: "게시글이 없습니다." });
  }
  const comment = await prisma.comment.create({
    where: { userId: +userId, postId: +postId },
    data: {
      userId: user.userId,
      postId: post.postId,
      content: content,
    },
  });
  return res.status(200).json({ message: "댓글 작성에 성공하였습니다." });
});

//댓글 조회 API
router.get("/comment", async (req, res, next) => {
  const { content } = req.body;
  const { commentId } = req.params;
  const { postId } = req.post;
  const findcomment = await prisma.comment.findMany({
    where: { commentId: +commentId },
    select: {
      postId: postId,
      commentId: commentId,
      content,
      createdAt,
    },
  });
  if (!commentId) {
    return res.status(404).json({ message: "댓글이 없습니다." });
  }
  return res.status(201).json({ data: findcomment });
});

//댓글 수정 API
router.put("/comment", async (req, res, next) => {});

//댓글 삭제 API
router.delete("/comment", async (req, res, next) => {});

export default express;
