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
import methodOverride from "method-override";

const app = express();
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const PORT = 3020;

app.set("view engine", "ejs");
app.use(LogMiddleware);
app.use(express.urlencoded({ extended: true }));

app.use(express.static(path.join(__dirname, "public")));
app.use(express.json());

app.use(cookieParser());
app.use(methodOverride("_method"));
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

app.get("/sign-token", (req, res) => {
  res.render("sign-token", { title: "가입 확인" });
});

app.get("/users/:userId", (req, res) => {
  res.render("users", { title: "게시판" });
});

app.get("/newspeed", (req, res) => {
  res.render("newspeed", { title: "뉴스피드" });
});

app.get("/mypage", (req, res) => {
  res.render("mypage", { title: "상세 페이지" });
});

app.use(ErrorHandlingMiddleware);

app.listen(PORT, () => {
  console.log(PORT, "포트로 서버가 열렸어요!");
});
