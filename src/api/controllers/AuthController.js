const express = require("express");
const { jwtSecretKey } = require("../../config/key");
const AuthService = require("../../services/AuthService");
const NotificationService = require("../../services/NotificationService");
const UserService = require("../../services/UserService");
const { checkAccessTokens, checkRefreshTokens } = require("../middleware/verifyToken");
const router = express();


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
    const userId = (await UserService(id)).userId

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
    expiresIn: 60 * 60 * 24 * 2,
  });

  return res.status(200).send({ accessToken: newAccessToken });
});


router.post("/", async (req, res) => {
  try {
    const phoneNumber = req.body.phoneNumber
    const authInstance = AuthService()
    const result = await authInstance.sendVerifyCode(phoneNumber);
    return res.status(200).send(result)
    
  } catch (err) {
    console.log(err)
    return res.status(400).send({ message: "본인인증 문자 발송 실패" });
  }
})

router.post("/confirm", async (req, res) => {
  try {
    const authData = req.body
    const authInstance = AuthService();
    const result = await authInstance.confirmVerifyCode(authData);
    return res.status(200).send(result)
  } catch (err) {
    console.log(err)
    return res.status(400).send({message:err.message})
  }
})

module.exports=router