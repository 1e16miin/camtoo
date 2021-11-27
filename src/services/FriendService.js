const {
  friend,
  user,
  sequelize,
} = require("../models");
const { Op } = require("sequelize");

const FriendService = (userId) => {
  const send = async (senderDto) => {

  }
  const add = async (followeeDto) => {};
  const confirm = async () => {};

  const remove = async () => {};

  const findById = async () => {
    const friendIds = await Promise.all([
      await friend.findAll({
        nest: true,
        raw: true,
        attributes: [["followee", "userId"]],
        where: { status: 2, follower: userId },
      }),
      await friend.findAll({
        nest: true,
        raw: true,
        attributes: [["follower", "userId"]],
        where: { status: 2, followee: userId },
      }),
    ]);
    const result = friendIds.flat().map((element) => element.userId);
    return result;
  };
  return { findById, add, confirm, remove, send };
};

module.exports = FriendService;
