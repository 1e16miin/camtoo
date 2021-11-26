const { timeTable } = require("../models");

const TimeTableService = (userId) => {
  const getAllSchedules = async () => {
    return await timeTable.findAll({
      nest: true,
      raw: true,
      attributes: [
        ["class_name", "scheduleName"],
        ["day_of_the_week", "dayOfTheWeek"],
        ["start_time", "startTime"],
        ["end_time", "endTime"],
        ["class_type", "classType"],
      ],
      where: { user_id: userId },
    });
  };
  
  const create = async (timeTableClasses, transaction) => {
    await Promise.all(timeTableClasses.map(async (schedule) => {
      const {dayOfTheWeek, startTime, endTime, scheduleType, scheduleName} = schedule
      const input = {
        user_id: userId,
        day_of_the_week: dayOfTheWeek,
        start_time: startTime,
        end_time: endTime,
        class_type: scheduleType,
        class_name: scheduleName ? scheduleName : "",
      };
      await timeTable.create(input, { transaction })
    }))
    return transaction
  }

  const update = async (timeTableClasses, transaction) => {
    await timeTable.destroy({ where: { user_id: userId }, transaction });
    await create(timeTableClasses, transaction);
    return transaction
  };

  return { getAllSchedules, create, update };
};

module.exports = TimeTableService;