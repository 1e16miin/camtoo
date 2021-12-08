const schedule = require("node-schedule");

const moment = require("moment");
const UserService = require("../services/UserService");
require("moment-timezone");
moment.tz.setDefault("Asia/Seoul");


schedule.scheduleJob("*/30 * * * *", async () => {
  if (process.env.INSTANCE_ID === "0") {
    const userInstance = await UserService()
    try {
      await rank.makeHotRecord();
    } catch (err) {
      console.log(err);
      console.log("실패");
    }
  }
});

