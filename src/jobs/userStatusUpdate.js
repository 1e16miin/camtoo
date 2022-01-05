const schedule = require("node-schedule");

const moment = require("moment");
const { sequelize, user, timeTable } = require("../models");
const { Op } = require("sequelize");
require("moment-timezone");
moment().tz("Asia/Seoul");

let rule = new schedule.RecurrenceRule();
rule.minute = new schedule.Range(0, 59, 30);

const userStatusUpdate = () =>
  schedule.scheduleJob(rule, async () => {
    if (process.env.INSTANCE_ID === "0") {
      const day = moment().day();
      const hour = (moment().hour()+9)%24;
      if (day != 0 && day != 6 && hour >= 9 && hour <= 20) {
        const time = moment().minute() + hour * 60;

        let transaction = await sequelize.transaction();
        try {
          const allUsers = await user.findAll({
            nest: true,
            raw: true,
            attributes: ["userId", "time_tables.scheduleType", "status"],
            include: [
              {
                model: timeTable,
                where: {
                  startTime: { [Op.lte]: time },
                  endTime: { [Op.gte]: time },
                  dayOfTheWeek: day - 1,
                },
                attributes: [],
                required: false,
              },
            ],
          });
          await Promise.all(
            allUsers.map(async (userData) => {
              let status = 2;
              if (userData.scheduleType) status = userData.scheduleType;
              await user.update(
                { status: status },
                { where: { userId: userData.userId }, transaction }
              );
            })
          );
          await transaction.commit();
          console.log("스케쥴링 완료");
        } catch (err) {
          console.log("스케쥴링 에러");
          await transaction.rollback();
        }
      }
    }
  });

module.exports = { userStatusUpdate };
