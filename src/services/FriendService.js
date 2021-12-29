const { friend, user, sequelize, communication } = require("../models");
const { Op } = require("sequelize");
const NotificationService = require("./NotificationService");
const UserService = require("./UserService");

const FriendService = (userId = null) => {
  const send = async (receiverDto, payload) => {
    let transaction = await sequelize.transaction();
    try {
      const receiver = (await UserService(receiverDto.id)).userId;
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

  const invite = async (phoneNumber) => {
    const downloadUrl = "https://vt.tiktok.com/ZSeSEyotJ/";
    const notificationInstance = NotificationService(userId);
    const message = `캠투 다운로드 링크: ${downloadUrl}`;
    const result = await notificationInstance.sendSMS(phoneNumber, message);
    return result;
  };

  const add = async (followeeDto) => {
    let transaction = await sequelize.transaction();
    try {
      const followee = (await UserService(followeeDto.id)).userId;
      const notificationInstance = NotificationService(userId);
      const message = `님으로부터 친구요청이 왔어요!`;
      let connectionData = {
        follower: userId,
        followee: followee,
      };
      let isExist = await friend.findOne({
        raw: true,
        where: connectionData,
      });
      connectionData.followee = userId;
      connectionData.follower = followee;
      isExist = await friend.findOne({
        raw: true,
        where: connectionData,
      });
      if (isExist) {
        throw new Error("이미 존재하는 관계입니다.");
      }

      connectionData.followee = followee;
      connectionData.follower = userId;
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
    let transaction = await sequelize.transaction();
    try {
      const userInstance = await UserService(followerDto.id);
      const follower = userInstance.userId;
      let connection = await friend.findOne({
        where: { follower: userId, followee: follower },
      });
      if (!connection) {
        connection = await friend.findOne({
          where: { follower: follower, followee: userId },
        });
      }
      if (!connection) {
        throw new Error("connection is not exist");
      } else {
        if (response) await connection.update({ status: 1 }, { transaction });
        else await connection.destroy({ transaction });
      }
      await transaction.commit();
      return "success";
    } catch (err) {
      await transaction.rollback();
      throw err;
    }
  };

  const remove = async () => {};

  // const findAll = async (idList) => {
  //   const signedFriendIdListInPhoneBook = (
  //     await user.findAll({
  //       nest: true,
  //       raw: true,
  //       attributes: [["user_id", "userId"]],
  //       where: { id: idList },
  //     })
  //   ).map((foundUser) => foundUser.id);
  //   const option = { [Op.ne]: 0 };
  //   const friendObject = await findById(option);
  //   const friendIdList = Object.keys(friendObject);
  //   const result = await Promise.all(
  //     signedFriendIdListInPhoneBook.map(async (signedUserId) => {
  //       const userInstance = await UserService(null);
  //       const signedUserData = userInstance.getUserData(signedUserId);
  //       let friendStatus = 0;
  //       if (friendIdList.includes(signedUserId)) {
  //         friendStatus = friendObject.signedUserId;
  //       }
  //       const result = {
  //         user: signedUserData,
  //         friendStatus: friendStatus,
  //       };
  //       return result;
  //     })
  //   );
  //   return result;
  // };
  const getFriendDto = async (friendDAO) => {
    const userInstance = await UserService(null);
    const userData = await userInstance.getUserData(friendDAO.userId);
    const result = { user: userData, friendStatus: friendDAO.friendStatus };
    return result;
  };

  const getFriendList = async (friendIdList) => {
    // console.log(friendDAOList);
    const result = await Promise.all(
      friendIdList.map(async (friendDAO) => getFriendDto(friendDAO))
    );
    return result;
  };

  const findAll = async (option) => {
    const result = (
      await Promise.all([
        await getFollowedList(option),
        await getFollowingList(option),
      ])
    ).flat();
    return result;
  };

  const getFollowingList = async (option) => {
    return await friend.findAll({
      nest: true,
      raw: true,
      attributes: [
        ["followee", "userId"],
        ["status", "friendStatus"],
      ],
      where: { status: option, follower: userId },
    });
  };

  const getFollowedList = async (option) => {
    return await friend.findAll({
      nest: true,
      raw: true,
      attributes: [
        ["follower", "userId"],
        ["status", "friendStatus"],
      ],
      where: { status: option, followee: userId },
    });
  };

  const messageLog = async (friendId) => {
    const friend = (await UserService(friendId)).userId;
    const messages = (
      await Promise.all([
        await communication.findAll({
          nest: true,
          raw: true,
          attributes: ["sender", "message", "createdAt"],
          where: { sender: userId, receiver: friend },
        }),
        await communication.findAll({
          nest: true,
          raw: true,
          attributes: ["sender", "message", "createdAt"],
          where: { sender: friend, receiver: userId },
        }),
      ])
    ).flat();
    const result = messages.sort((first, second) => {
      return first.createdAt - second.createdAt;
    });
    return result;
  };

  return {
    getFriendList,
    getFollowingList,
    getFollowedList,
    add,
    confirm,
    remove,
    send,
    findAll,
    invite,
    messageLog,
  };
};

module.exports = FriendService;
