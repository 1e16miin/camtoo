const express = require("express");
const FriendService = require("../../services/FriendService");
const NotificationService = require("../../services/NotificationService");
const UserService = require("../../services/UserService");
const { checkAccessTokens } = require("../middlewares/verifyToken");
const router = express();

router.post("/add", checkAccessTokens, async (req, res) => {
  try {
    const id = req.id;
    const { followee } = req.body;
    const userInstance = await UserService(id);
    const followerId = userInstance.userId;
    const friendInstance = FriendService(followerId);
    const result = await friendInstance.add(followee);
    return res.status(200).send(result);
  } catch (err) {
    console.log(err);
    return res.status(400).send(err.message);
  }
});


router.put("/confirm", checkAccessTokens, async (req, res) => {
  const id = req.id
});

router.get("/search", checkAccessTokens, async (req, res) => {
  
})

router.post("/invite", checkAccessTokens, async (req, res) => {
});

router.post("/list", checkAccessTokens, async (req, res) => {
  try {
    const id = req.id;
    const idList = req.body.idList
    const userId = (await UserService(id)).userId;
    const friendInstance = FriendService(userId);
    const result = await friendInstance.findAll(idList);
    return res.status(200).send(result);
  } catch (err) {
    console.log(err);
    return res.status(400).send(err.message);
  }
});

router.post("/message/send", checkAccessTokens, async (req, res) => {
  try {
    const id = req.id;
    const { receiver, payload } = req.body;
    const userInstance = await UserService(id)
    const senderId = userInstance.userId
    const friendInstance = FriendService(senderId);
    const result = await friendInstance.send(receiver, payload);

    return res.status(200).send(result);
  } catch (err) {
    console.log(err);
    return res.status(400).send(err.message);
  }
});

router.get("/message/log", checkAccessTokens, (req, res) => {});

module.exports = router;
