const { friend, user, sequelize, communication } = require("../models");
const { Op } = require("sequelize");
const NotificationService = require("./NotificationService");
const UserService = require("./UserService");

const FriendService = (userId) => {
  const send = async (receiverDto, payload) => {
    let transaction = await sequelize.transaction();
    try {
      const receiver = (await UserService(receiverDto.id)).userId;
      console.log(receiver);
      const notificationInstance = NotificationService(userId);
      const message = ` : ${payload}`;
      const communicationData = {
        sender: userId,
        receiver: receiver,
        message: message
      };
      await communication.create(communicationData,{transaction});
      const result = await notificationInstance.sendPush(receiver, message);
      await transaction.commit()
      return result;
    } catch (err) {
      await transaction.rollback()
      console.log(err);
      throw err;
    }
  };

  const add = async (followeeDto) => {
    let transaction = await sequelize.transaction();
    try {
      const followee = (await UserService(followeeDto.id)).userId;
      const notificationInstance = NotificationService(userId);
      const message = `님으로부터 친구요청이 왔어요!`;
      const connectionData = {
        follower: userId,
        followee: followee,
      }
      await friend.create(connectionData, {transaction});
      const result = await notificationInstance.sendPush(followee, message);
      await transaction.commit()
      return result;
    } catch (err) {
      await transaction.rollback();
      throw err;
    }
  };

  const confirm = async () => {};

  const remove = async () => {};

  const findAll = async () => {
    const option = { [Op.ne]: 0 };
    const friendIdList = await findById(option);
    const allFriend = await Promise.all()
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
