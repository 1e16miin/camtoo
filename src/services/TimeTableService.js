const { timeTable } = require("../models");

const TimeTableService = (userId) => {
  const getAllSchedules = async () => {
    return await timeTable.findAll({
      nest: true,
      raw: true,
      attributes: [
        ["class_name", "className"],
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
      const {dayOfTheWeek, startTime, endTime, classType, className} = schedule
      const input = {
        user_id:userId,
        day_of_the_week: dayOfTheWeek,
        start_time: startTime,
        end_time: endTime,
        class_type: classType,
        class_name: className
      }
      await timeTable.create(input, { transaction })
    }))
    return transaction
  }

  const update = async () => {

  }

  return { getAllSchedules, create, update };
};

module.exports = TimeTableService;