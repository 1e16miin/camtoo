const express = require("express");
const UserService = require("../../services/UserService");
const { checkAccessTokens } = require("../middlewares/verifyToken");
const router = express();


router.get("/information", checkAccessTokens, async (req, res) => {
  try {
    const id = req.query.id;
    const userInstance = await UserService(id);
    const result = userInstance.userData
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
    const result = userInstance.userData
    return res.status(200).send(result);
  } catch (err) {
    console.log(err)
    return res
      .status(400)
      .send({ message: "유저 정보를 조회하는 중에 에러가 발생하였습니다." });
  }
});

router.put("/update", checkAccessTokens, async (req, res) => {
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

module.exports = router