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
        message: message,
      };
      await communication.create(communicationData, { transaction });
      const result = await notificationInstance.sendPush(receiver, message);
      await transaction.commit();
      return result;
    } catch (err) {
      await transaction.rollback();
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
      };
      await friend.create(connectionData, { transaction });
      const result = await notificationInstance.sendPush(followee, message);
      await transaction.commit();
      return result;
    } catch (err) {
      await transaction.rollback();
      throw err;
    }
  };

  const confirm = async (followerDto, response) => {
    const userInstance = await UserService()
  };

  const remove = async () => {};

  const findAll = async (idList) => {
    const signedFriendIdListInPhoneBook = (
      await user.findAll({
        nest: true,
        raw: true,
        attributes: [["user_id", "userId"]],
        where: { id: idList },
      })
    ).map((foundUser) => foundUser.id);
    const option = { [Op.ne]: 0 };
    const friendObject = await findById(option);
    const friendIdList = Object.keys(friendObject);
    const result = await Promise.all(
      signedFriendIdListInPhoneBook.map(async (signedUserId) => {
        const userInstance = await UserService(signedUserId);
        const signedUserData = userInstance.userData;
        let friendStatus = 0;
        if (friendIdList.includes(signedUserId)) {
          friendStatus = friendObject.signedUserId;
        }
        const result = {
          user: signedUserData,
          friendStatus: friendStatus,
        };
        return result;
      })
    );
    return result;
  };

  const findById = async (option) => {
    const friendObjectList = await Promise.all([
      await friend.findAll({
        nest: true,
        raw: true,
        attributes: [
          ["followee", "userId"],
          ["status", "friendStatus"],
        ],
        where: { status: 2, follower: userId },
      }),
      await friend.findAll({
        nest: true,
        raw: true,
        attributes: [
          ["follower", "userId"],
          ["status", "friendStatus"],
        ],
        where: { status: option, followee: userId },
      }),
    ]);
    const friendList = friendObjectList
      .flat()
      .map((friendObject) => [friendObject.userID, friendObject.friendStatus]);
    const friendEntries = new Map([friendList]);
    const result = Object.fromEntries(friendEntries);
    return result;
  };
  return { findById, add, confirm, remove, send, findAll };
};

module.exports = FriendService;
