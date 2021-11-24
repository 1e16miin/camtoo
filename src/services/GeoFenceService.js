const {
  boundary,
  building,
  resident,
  friend,
  user,
  sequelize,
} = require("../models");
const { Op } = require("sequelize");

const GeoFenceService = (universityId = 1, profileId = 1) => {
  const getBuildings = async () => {
    let buildingData = await building.findAll({
      nest: true,
      raw: true,
      where: { university_id: universityId },
      attributes: [["id", "building_id"], "x", "y"],
    });

    const friendIds = (
      await Promise.all([
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
      ])
    )
      .flat()
      .map((element) => element.profile_id);
    // const friendIds = (
    //   await friend.findAll({
    //     nest: true,
    //     raw: true,
    //     attributes: ["user.id"],
    //     where: { status: "A" },
    //     include: [{ model: user, where: { profile_id: profileId } }],
    //   })
    // ).map((element) => element.id);

    buildingData = await Promise.all(
      buildingData.map(async (building) => {
        // const boundaryData = await boundary.findAll({
        //   nest: true,
        //   raw: true,
        //   attributes: ["x", "y"],
        //   where: { building_id: building.building_id },
        // });
        const numberOfFriend = await resident.count({
          // nest: true,
          // raw: true,
          // attributes: ["id"],
          where: { profile_id: friendIds, building_id: building.building_id },
          // include: [{ model: friend, attributes: [], required: true, where: { status: "A" },include:[{model:user, where:{profile_id:profileId}}] }],
        });

        // building.boundaries = boundaryData;
        const marker = { x: building.x, y: building.y };
        building.marker = marker;
        building.isEmpty = numberOfFriend === 0 ? 1 : 0;
        delete building.x;
        delete building.y;
        return building;
      })
    );

    return buildingData;
  };

  const getMembers = async (buildingId) => {
    const members = (
      await resident.findAll({
        nest: true,
        raw: true,
        attributes: ["profile_id"],
        where: { building_id: buildingId },
      })
    ).map((element) => element.profile_id);
    // const friendIds = await user.findAll({
    //   nest: true,
    //   raw: true,
    //   where:{profile_id:profileId},
    //   include: [
    //     {
    //       model: friend,
    //       where:{status:"A"}
    //     }
    //   ]
    // });
    const friendIds = (
      await Promise.all([
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
      ])
    )
      .flat()
      .map((element) => element.profile_id);

    // console.log(friendIds, members)
    const result = (
      await Promise.all(
        members.map(async (profileId) => {
          let result = { profile_id: profileId, isFriend: 0 };
          const userData = await user.findOne({
            nest: true,
            raw: true,
            attributes: ["open_type"],
            where: { profile_id: profileId },
          });

          if (friendIds.includes(profileId)) {
            result.isFriend = 1;
          } else if (userData.open_type !== "A") {
            return null;
          }
          return result;
        })
      )
    )
      .filter(Boolean)
      .sort(function (a, b) {
        return a.isFriend > b.isFriend ? -1 : a.isFriend < b.isFriend ? 1 : 0;
      });
    return result;
  };

  const entrance = async (buildingId) => {
    let transaction = sequelize.transaction();
    try {
      const enterData = {
        building_id: buildingId,
        profile_id: profileId,
      };
      await resident.create(enterData, { transaction });
      await transaction.commit();
    } catch (err) {
      await transaction.rollback();
      throw err;
    }
  };
  const exit = async (buildingId) => {
    let transaction = sequelize.transaction();
    try {
      await resident.destroy({
        where: { building_id: buildingId, profile_id: profileId },
        transaction,
      });
      await transaction.commit();
    } catch (err) {
      await transaction.rollback();
      throw err;
    }
  };

  return { getBuildings, getMembers, entrance, exit };
};

module.exports = GeoFenceService;
