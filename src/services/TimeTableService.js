const { schedule } = require("../models");

const TimeTableService = (profileId) => {
  const getAllSchedules = async () => {
    return await schedule.findAll({
      nest: true,
      raw: true,
      attributes: [
        ["class_name", "className"],
        ["day_of_the_week", "dayOfTheWeek"],
        ["start_time", "startTime"],
        ["end_time", "endTime"],
        ["class_type", "classType"],
      ],
      where: { profile_id: profileId },
    });
  };
  
  const create = async () => {

  }

  const update = async () => {

  }

  return { getAllSchedules, create, update };
};

module.exports = TimeTableService;