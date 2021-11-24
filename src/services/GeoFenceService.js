const {
  boundary,
  building,
  member,
  friend,
  user,
  sequelize,
} = require("../models");
const { Op } = require("sequelize");
const FriendService = require("./FriendService");
const UserService = require("./UserService");

const GeoFenceService = (universityId = 1, profileId = 1) => {
  const friendInstance = FriendService(profileId);
  
  // const userInstance = UserService()
  
  

  const findAllInSchoolUserId = async () => {
    const inSchoolUsers = await user.findAll({ raw: true, nest: true, where: { in_school: 1 } })
    const result = inSchoolUsers.map(user => user.profile_id)
    return result
  };

  const getInSchoolUsers = async () => {
    const friendIdList = await friendInstance.findById(profileId);
    const inSchoolUsersId = await findAllInSchoolUserId()
    const inSchoolUsers = (await Promise.all(inSchoolUsersId.map(id => {
      let isFriend = false
      if (friendIdList.includes(id)) {
        isFriend = true
      }
      
      const userData = await UserService(id).getUserData();
      // publicProfileMode: public_profile_mode,
      if (userData.publicProfileMode === 0 && !isFriend) {
        return null
      }
      const result = {
        user: userData,
        isFriend: isFriend
      }
      return result
    }))).filter(Boolean);

    const result = {
      userInSchool: inSchoolUsers,
    };
    return result
  }

  const getBuildingInFriends = async () => {

  }

  const getBuildings = async () => {
    let buildingData = await building.findAll({
      nest: true,
      raw: true,
      where: { university_id: universityId },
      attributes: [["id", "building_id"], "latitude", "longitude"],
    });

   
   

    buildingData = await Promise.all(
      buildingData.map(async (building) => {
        // const boundaryData = await boundary.findAll({
        //   nest: true,
        //   raw: true,
        //   attributes: ["x", "y"],
        //   where: { building_id: building.building_id },
        // });
        const numberOfFriend = await member.count({
          // nest: true,
          // raw: true,
          // attributes: ["id"],
          where: { profile_id: friendIds, building_id: building.building_id },
          // include: [{ model: friend, attributes: [], required: true, where: { status: "A" },include:[{model:user, where:{profile_id:profileId}}] }],
        });

        // building.boundaries = boundaryData;
        const marker = {
          latitude: building.latitude,
          longitude: building.longitude,
        };
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
      await member.findAll({
        nest: true,
        raw: true,
        attributes: ["profile_id"],
        where: { building_id: buildingId },
      })
    ).map((element) => element.profile_id);

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
      await member.create(enterData, { transaction });
      await user.update({in_building:1},{where:{id:profileId}, transaction})
      await transaction.commit();
    } catch (err) {
      await transaction.rollback();
      throw err;
    }
  };
  const exit = async (buildingId) => {
    let transaction = sequelize.transaction();
    try {
      await member.destroy({
        where: { building_id: buildingId, profile_id: profileId },
        transaction,
      });
      await user.update(
        { in_building: 0 },
        { where: { id: profileId }, transaction }
      );
      await transaction.commit();
    } catch (err) {
      await transaction.rollback();
      throw err;
    }
  };

  return { getBuildings, getMembers, entrance, exit };
};

module.exports = GeoFenceService;
