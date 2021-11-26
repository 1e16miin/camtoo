const express = require("express");
const NotificationService = require("../../services/NotificationService");
const UserService = require("../../services/UserService");
const { checkAccessTokens } = require("../middlewares/verifyToken");
const router = express();

router.post("/add", checkAccessTokens, async (req, res) => {
  try {
    const followerId = req.id;
    const { followee, followerName } = req.body;
    const notificationInstance = NotificationService(followerId);
    const result = await notificationInstance.sendPush(
      followee.id,
      followerName
    );
    return res.status(200).send(result);
  } catch (err) {
    console.log(err);
    return res.status(400).send(err.message);
  }
});
router.put("/approval", checkAccessTokens, async (req, res) => {});

router.post("/invite", checkAccessTokens, async (req, res) => {});

router.get("/list", checkAccessTokens, async (req, res) => {
  const id = req.id


});

router.post("/message/send", checkAccessTokens, async (req, res) => {
  try {
    const senderId = req.id;
    const { receiver, senderName, payload } = req.body;
    const notificationInstance = NotificationService(senderId);
    console.log(receiver)
    const result = await notificationInstance.sendPush(
      receiver.id,
      senderName,
      payload
    );
    return res.status(200).send(result);
  } catch (err) {
    console.log(err);
    return res.status(400).send(err.message);
  }
});
router.get("/message/log", checkAccessTokens, (req, res) => {});

module.exports = router;
