import express from "express";
import cookieParser from "cookie-parser";
import CommentRouter from "./router/comment.router.js";
import LikeRouter from "./router/like.router.js";
import PostRouter from "./router/post.router.js";
import UserRouter from "./router/user.router.js";

const app = express();
const PORT = 3018;

app.use(express.json());
app.use(cookieParser());
app.use("/", [CommentRouter, LikeRouter, PostRouter, UserRouter]);

app.listen(PORT, () => {
  console.log(PORT, "포트로 서버가 열렸어요!");
});
