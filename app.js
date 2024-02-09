import express from "express";
import cookieParser from "cookie-parser";
import CommentRouter from "./router/comment.router.js";
import SignRouter from "./router/sign-up.router.js";
import LikeRouter from "./router/like.router.js";
import PostRouter from "./router/post.router.js";
import OauthRouter from "./router/oauth.router.js";
import LogMiddleware from "./middlewares/log.middleware.js";
import ErrorHandlingMiddleware from "./middlewares/error-handling.middleware.js";
import UserRouter from "./router/users.router.js";
import path from "path";
import { fileURLToPath } from "url";
import newspeedRouter from "./router/newspeed.router.js";
import FriendshipRouter from "./router/friendship.router.js";

const app = express();
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const PORT = 3020;

app.set("view engine", "ejs");
app.use(LogMiddleware);
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, "public")));
app.use(express.json());

app.use(cookieParser());
app.use("/", [
  CommentRouter,
  LikeRouter,
  PostRouter,
  UserRouter,
  SignRouter,
  OauthRouter,
  newspeedRouter,
  FriendshipRouter,
]);

app.get("/sign-up", (req, res) => {
  res.render("sign-up", { title: "회원가입" });
});

app.get("/sign-in", (req, res) => {
  res.render("sign-in", { title: "로그인" });
});

app.get("/post", (req, res) => {
  res.render("post", { title: "게시판" });
});

app.get("/chat", async (req, res) => {
  res.render("chat", { messages: messages, username: username });
});

app.use(ErrorHandlingMiddleware);

app.listen(PORT, () => {
  console.log(PORT, "포트로 서버가 열렸어요!");
});
