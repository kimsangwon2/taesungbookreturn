import express from "express";
import { prisma } from "../index.js";
import jwt from "jsonwebtoken";
import axios from "axios";

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

  const userJWT = jwt.sign({ userId: users.id }, process.env.JWT_SECRET);
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

  const userJWT = jwt.sign({ userId: users.id }, process.env.JWT_SECRET);
  res.cookie("authorization", `Bearer ${userJWT}`);

  return res.status(200).json({ message: "로그인 성공" });
});

router.get("/oauth/google/logout", (req, res) => {
  res.clearCookie("authorization");
  return res.status(200).json({ message: "로그아웃 성공" });
});

router.get("/oauth/logout/callback", (req, res) => {
  return res.status(200).json({ message: "로그아웃 성공" });
});

export default router;
