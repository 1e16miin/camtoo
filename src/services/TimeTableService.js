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
    await Promise.all(timeTableClasses.map(async (scheduleDTO) => {
      await timeTable.create(scheduleDTO, { transaction })
    }))
    return transaction
  }

  const update = async (timeTableClasses, transaction) => {
    await timeTable.destroy({ where: { userId: userId }, transaction });
    await create(timeTableClasses, transaction);
    return transaction
  };

  return { getAllSchedules, create, update };
};

module.exports = TimeTableService;