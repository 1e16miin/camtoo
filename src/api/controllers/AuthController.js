const express = require("express");
const { jwtSecretKey } = require("../../config/key");
const AuthService = require("../../services/AuthService");
const NotificationService = require("../../services/NotificationService");
const UserService = require("../../services/UserService");
const { checkAccessTokens, checkRefreshTokens } = require("../middlewares/verifyToken");
const router = express();
const LRU = require("lru-cache");

 const options = {
   max: 11,
   maxAge: 180,
   length: function (n, key) {
     return n.length;
   },
   dispose: function (key, n) {
     console.log(key);
   },
};
 
const cache = new LRU(options);


router.post("/sign-up", async (req, res) => {
  try {
    const signUpData = req.body
    const authInstance = AuthService()
    const result = await authInstance.createNewUser(signUpData)
    return res.status(200).send(result)
  } catch (err) {
    console.log(err)
    return res.status(400).send(err.message)
  }
})

router.post("/register/device-token", checkAccessTokens, async (req, res) => {
  try {
    const id = req.id

    const deviceToken = req.body.deviceToken
    const userId = await (await UserService(id)).userId

    const notificationInstance = NotificationService(userId);
    const result = await notificationInstance.postDeviceToken(deviceToken);
    if (result === 400) {
      throw new Error("디바이스 토큰 등록중 에러가 발생했습니다.")
    }
    return res.status(200).send("success")
  } catch (err) {
    return res.status(400).send(err.message);
  }
});

router.get("/issue/access-token", checkRefreshTokens, async (req, res) => {
  const id = req.id;
  const newAccessToken = jwt.sign({ id: id, type: "A" }, jwtSecretKey, {
    expiresIn: 60 * 60 * 2,
  });

  return res.status(200).send({ accessToken: newAccessToken });
});


router.post("/", async (req, res) => {
  try {
    const phoneNumber = req.body.phoneNumber
    const authInstance = AuthService()
    const result = await authInstance.sendVerifyCode(phoneNumber, cache);
    return res.status(200).send(result)
    
  } catch (err) {
    console.log(err)
    return res.status(400).send({ message: "본인인증 문자 발송 실패" });
  }
})

router.post("/confirm", async (req, res) => {
  try {
    const authData = req.body
    console.log(authData)
    const authInstance = AuthService();
    const result = await authInstance.confirmVerifyCode(authData, cache);
    return res.status(200).send(result)
  } catch (err) {
    console.log(err)
    return res.status(400).send({message:err.message})
  }
})

module.exports=router