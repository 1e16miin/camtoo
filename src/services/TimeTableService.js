const { timeTable } = require("../models");

const TimeTableService = (userId) => {
  const getAllSchedules = async () => {
    return await timeTable.findAll({
      nest: true,
      raw: true,
      attributes: {exclude: ["createdAt","deletedAt", "updatedAt"]},
      where: { userId: userId },
    });
  };
  
  const create = async (timeTableClasses, transaction) => {
    await Promise.all(timeTableClasses.map(async (scheduleDto) => {
      scheduleDto.userId = userId
      await timeTable.create(scheduleDto, { transaction })
    }))
  }

  const update = async (timeTableClasses, transaction) => {
    await timeTable.destroy({ where: { userId: userId }, transaction });
    await create(timeTableClasses, transaction);
  };

  return { getAllSchedules, create, update };
};

module.exports = TimeTableService;