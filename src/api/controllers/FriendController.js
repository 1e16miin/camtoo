const express = require("express");
const NotificationService = require("../../services/NotificationService");
const { checkAccessTokens } = require("../middlewares/verifyToken");
const router = express();

router.post("/add", checkAccessTokens, (req, res) => {});
router.put("/approval", checkAccessTokens, (req, res) => {});

router.post("/invite", checkAccessTokens, (req, res) => {});

router.get("/list", checkAccessTokens, (req, res) => {});

router.post("/message/send", checkAccessTokens, (req, res) => {
  try {
    const id = req.id;
    const { receiver, payload } = req.body;
    const sender = await(await UserService(id)).userId;
    const notificationInstance = NotificationService(sender);
    const result = await notificationInstance.sendPush(receiver, payload);
    return res.status(200).send(result)
  } catch (err) {
    console.log(err);
    return res.status(400).send(err.message)
  }
});
router.get("/message/log", checkAccessTokens, (req, res) => {});

module.exports = router;
