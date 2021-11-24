const {
  friend,
  user,
  sequelize,
} = require("../models");
const { Op } = require("sequelize");

const FriendService = (profileId) => {
  const add = async (followee) => {};
  const confirm = async () => {};

  const remove = async () => {};

  const findById = async () => {
    const friendIds = await Promise.all([
      await friend.findAll({
        nest: true,
        raw: true,
        attributes: [["followed_user_id", "profile_id"]],
        where: { status: "A", following_user_id: profileId },
      }),
      await friend.findAll({
        nest: true,
        raw: true,
        attributes: [["following_user_id", "profile_id"]],
        where: { status: "A", followed_user_id: profileId },
      }),
    ]);
    const result = friendIds.flat().map((element) => element.profile_id);
    return result;
  };
  return { findById, add, confirm, remove };
};

module.exports = FriendService;
