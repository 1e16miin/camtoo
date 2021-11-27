const { friend, user, sequelize } = require("../models");
const { Op } = require("sequelize");
const NotificationService = require("./NotificationService");
const UserService = require("./UserService");

const FriendService = (userId) => {
  const send = async (receiverDto, payload) => {
    try {
      
      const receiver = (await UserService(receiverDto.id)).userId;
      console.log(receiver)
      const notificationInstance = NotificationService(userId);
      const result = await notificationInstance.sendPush(receiver, payload);
      return result;
    } catch (err) {
      console.log(err);
      throw err;
    }
  };
  const add = async (followeeDto) => {};
  const confirm = async () => {};

  const remove = async () => {};

  const findAll = async () => {
    const option = { [Op.ne]: 0 };
    const friendIdList = await findById(option);
    // const
  };

  const findById = async (option) => {
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
        where: { status: option, followee: userId },
      }),
    ]);
    const result = friendIds.flat().map((element) => element.userId);
    return result;
  };
  return { findById, add, confirm, remove, send, findAll };
};

module.exports = FriendService;
