import express from "express";
import { prisma } from "../index.js";
import jwt from "jsonwebtoken";
import axios from "axios";
import requestPromise from "request-promise-native";

const router = express.Router();

router.get("/oauth", (req, res) => {
  const kakaoAuthUrl = `https://kauth.kakao.com/oauth/authorize?client_id=${process.env.KAKAO_ID}&redirect_uri=${process.env.KAKAO_REDIRECT_URI}&response_type=code`;
  res.redirect(kakaoAuthUrl);
});

router.get("/oauth/callback", async (req, res) => {
  const code = req.query.code;
  const tokenRequest = await axios({
    method: "POST",
    url: "https://kauth.kakao.com/oauth/token",
    headers: {
      "content-type": "application/x-www-form-urlencoded",
    },
    data: {
      grant_type: "authorization_code",
      client_id: process.env.KAKAO_ID,
      redirect_uri: process.env.KAKAO_REDIRECT_URI,
      code,
    },
  });

  const { access_token } = tokenRequest.data;
  const profileRequest = await axios({
    method: "GET",
    url: "https://kapi.kakao.com/v2/user/me",
    headers: {
      Authorization: `Bearer ${access_token}`,
    },
  });

  const { email, profile } = profileRequest.data.kakao_account;
  const name = profile.nickname;
  const user = await prisma.users.findFirst({ where: { email } });
  const users = await prisma.users.upsert({
    where: { email },
    update: { email, name },
    create: {
      email,
      name,
      password: "default",
      Checkpass: "default",
      emailstatus: "yes",
    },
  });

  const userJWT = jwt.sign(
    {
      userId: user.userId,
    },
    process.env.JWT_SECRET,
    { expiresIn: "12h" }
  );

  res.cookie("authorization", `Bearer ${userJWT}`);

  return res.status(200).json({ message: "로그인 성공" });
});

router.get("/oauth/logout", async (req, res) => {
  const kakaoAuthUrl = `https://kauth.kakao.com/oauth/logout?client_id=${process.env.KAKAO_ID}&logout_redirect_uri=${process.env.KAKAO_LOGOUT_URI}`;
  res.redirect(kakaoAuthUrl);
});
router.get("/oauth/logout/callback", (req, res) => {
  return res.status(200).json({ message: "로그아웃 성공" });
});

router.get("/oauth/google", (req, res) => {
  const googleAuthUrl = `https://accounts.google.com/o/oauth2/v2/auth?client_id=${process.env.GOOGLE_CLIENT_ID}&redirect_uri=${process.env.GOOGLE_REDIRECT_URI}&response_type=code&scope=email%20profile`;
  res.redirect(googleAuthUrl);
});

router.get("/oauth/google/callback", async (req, res) => {
  const code = req.query.code;
  const tokenRequest = await axios({
    method: "POST",
    url: "https://oauth2.googleapis.com/token",
    headers: {
      "content-type": "application/x-www-form-urlencoded",
    },
    data: {
      grant_type: "authorization_code",
      client_id: process.env.GOOGLE_CLIENT_ID,
      client_secret: process.env.GOOGLE_CLIENT_SECRET,
      redirect_uri: process.env.GOOGLE_REDIRECT_URI,
      code,
    },
  });

  const { access_token } = tokenRequest.data;
  const profileRequest = await axios({
    method: "GET",
    url: "https://www.googleapis.com/oauth2/v3/userinfo",
    headers: {
      Authorization: `Bearer ${access_token}`,
    },
  });

  const { email, name } = profileRequest.data;
  const user = await prisma.users.findFirst({ where: { email } });
  const users = await prisma.users.upsert({
    where: { email },
    update: { email, name },
    create: {
      email,
      name,
      password: "default",
      Checkpass: "default",
      emailstatus: "yes",
    },
  });

  const userJWT = jwt.sign(
    {
      userId: user.userId,
    },
    process.env.JWT_SECRET,
    { expiresIn: "12h" }
  );
  res.cookie("authorization", `Bearer ${userJWT}`);

  req.session.userId = user.userId;
  return res.status(200).json({ message: "로그인 성공" });
});

router.get("/oauth/google/logout", (req, res) => {
  res.clearCookie("authorization");
  return res.status(200).json({ message: "로그아웃 성공" });
});

router.get("/oauth/logout/callback", (req, res) => {
  return res.status(200).json({ message: "로그아웃 성공" });
});

router.get("/oauth/naver", (req, res) => {
  const api_url = `https://nid.naver.com/oauth2.0/authorize?response_type=code&client_id=${process.env.NAVER_CLIENT_ID}&redirect_uri=${process.env.NAVER_REDIRECT_URI}&state=hLiDdL2uhPtsftcU`;
  res.writeHead(200, { "Content-Type": "text/html;charset=utf-8" });
  res.end(
    `<a href="${api_url}"><img height='50' src='http://static.nid.naver.com/oauth/small_g_in.PNG'/></a>`
  );
});

router.get("/oauth/naver/callback", async (req, res) => {
  const code = req.query.code;

  const tokenRequest = await axios({
    method: "POST",
    url: "https://nid.naver.com/oauth2.0/token",
    headers: {
      "content-type": "application/x-www-form-urlencoded",
    },
    params: {
      grant_type: "authorization_code",
      client_id: process.env.NAVER_CLIENT_ID,
      client_secret: process.env.NAVER_SECRET,
      redirect_uri: process.env.NAVER_REDIRECT_URI,
      code,
    },
  });

  const { access_token } = tokenRequest.data;

  if (!access_token) {
    return res.status(400).json({ message: "토큰을 받아오지 못했습니다." });
  }

  const profileRequest = await axios({
    method: "GET",
    url: "https://openapi.naver.com/v1/nid/me",
    headers: {
      Authorization: `Bearer ${access_token}`,
    },
  });

  const { id, name } = profileRequest.data.response;

  const users = await prisma.users.upsert({
    where: { email: id },
    update: { email: id, name },
    create: {
      email: id,
      name,
      password: "default",
      Checkpass: "default",
      emailstatus: "yes",
    },
  });
  const user = await prisma.users.findFirst({ where: { email: id } });
  const userJWT = jwt.sign(
    {
      userId: user.userId,
    },
    process.env.JWT_SECRET,
    { expiresIn: "12h" }
  );
  res.cookie("authorization", `Bearer ${userJWT}`);

  return res.status(200).json({ message: "로그인 성공" });
});

export default router;
