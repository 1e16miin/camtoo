const express = require("express");
const UserService = require("../../services/UserService");
const { checkAccessTokens } = require("../middleware/verifyToken");
const router = express();
const moment = require('moment-timezone');
const GeoFenceService = require("../../services/GeoFenceService");

const superagent = require("superagent");
moment().tz("Asia/Seoul")

router.get("/information", checkAccessTokens, async (req, res) => {
  try {
    const id = req.query.id ? req.query.id : req.id;
    const userInstance = await UserService(id);
    const userId = userInstance.userId
    const result = await userInstance.getUserData(userId)
    return res.status(200).send(result)
  } catch (err) {
    console.log(err)
    return res.status(400).send({message:"유저 정보를 조회하는 중에 에러가 발생하였습니다."})
  }
})


router.get("/my-profile", checkAccessTokens, async (req, res) => {
  try {
    const id = req.id;
    const userInstance = await UserService(id);
    const userId = userInstance.userId;
    const geoFenceInstance = GeoFenceService(userId);
    const hangouts = await userInstance.getHangOuts(geoFenceInstance);
    const bestFriends = await userInstance.getBestFriend();
    const result = { hangouts: hangouts, bestFriends: bestFriends };
    return res.status(200).send(result);
  } catch (err) {
    console.log(err)
    return res
      .status(400)
      .send({ message: "유저 정보를 조회하는 중에 에러가 발생하였습니다." });
  }
});

router.patch("/update", checkAccessTokens, async (req, res) => {
  try {
    const id = req.id;
    const userData = req.body
    const userInstance = await UserService(id);
    const result = await userInstance.update(userData);
    return res.status(200).send(result);
  } catch (err) {
    console.log(err);
    return res
      .status(400)
      .send({ message: "유저 정보를 업데이트 하는 중에 에러가 발생하였습니다." });
  }
});

router.put("/location", checkAccessTokens, async (req, res) => {
  try {
    const id = req.id;
    const coordinate = req.body
    const userInstance = await UserService(id);
    const result = await userInstance.updateLocation(coordinate);
    return res.status(200).send(result);
  } catch(err) {
    console.log(err);
    return res
      .status(400)
      .send({
        message: "위치 정보를 업데이트 하는 중에 에러가 발생하였습니다.",
      });
  }
})

router.get("/image/upload", checkAccessTokens, async (req,res)=> {
  try{
    const userInstance = await UserService()
    const result = userInstance.getProfileImageUploadUrl()
    return res.status(200).send(result)
  }catch(err){
    console.log(err);
    return res
      .status(400)
      .send({
        message: "이미지 업로드하는 중에 에러가 발생하였습니다.",
      });
  }
})

module.exports = router