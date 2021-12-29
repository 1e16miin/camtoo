const {
  building,
  user,
  sequelize,
  entry,
  university,
} = require("../models");

const FriendService = require("./FriendService");
const UserService = require("./UserService");
const isInRange = require("../utils/isInRange");

const GeoFenceService = (userId) => {
  const findAllInSchoolUserId = async () => {
    const inSchoolUsers = await user.findAll({
      raw: true,
      nest: true,
      where: {
        in_school: 1,
      },
    });
    const result = inSchoolUsers.map((userData) => userData.user_id);
    return result;
  };

  const getUniversityData = async (universityId) => {
    const result = await university.findByPk(universityId, {
      attributes: ["latitude", "longitude", "radius"],
    });
    return result;
  };

  const getReadableUserDto = async (readableUserId, myCoordinate) => {
    const userInstance = await UserService(null);

    const userData = await userInstance.getUserData(readableUserId);
    if (user.publicProfileMode === 0) return null;
    // if (!isInRange(myCoordinate, userData.coordinate)) return null;
    const result = {
      user: userData,
      friendStatus: 0,
    };
    return result;
  };

  const getPeople = async (membersId) => {
    
    const friendInstance = FriendService(userId);
    let friendIdList = await friendInstance.findAll(2);
    console.log(friendIdList)
    // const friendList = await friendInstance.getFriendList(friendIdList);
    const followingIdList = await friendInstance.getFollowingList(1);
    friendIdList = (friendIdList.concat(followingIdList)).map(user=>user.userId);
    console.log(friendIdList)
    const notFriendUsersId = [...membersId].filter(
      (id) => friendIdList.indexOf(id) === -1
    );
    console.log(notFriendUsersId);
    friendIdList = membersId.filter((id) => friendIdList.indexOf(id) !== -1);
    const friendList = await friendInstance.getFriendList(friendIdList);
    console.log(friendIdList, 3)
    // const followingList = await friendInstance.getFriendList(followingIdList)
    // const friendIdList = friendDAOList.map((friendDAO) => friendDAO.userId);
    console.log(userId,1);
    const myCoordinate = await user.findOne({
      raw: true,
      nest: true,
      attributes: ["latitude", "longitude"],
      where: {
        user_id: userId,
      },
    });
    console.log(userId, 2);
    const readableUsers = (
      await Promise.all(
        notFriendUsersId.map(
          async (notFriendUserId) =>
            await getReadableUserDto(notFriendUserId, myCoordinate)
        )
      )
    ).filter(Boolean);
    const result = friendList.concat(readableUsers);
    return result;
  };

  const getOutDoorUsers = async () => {
    const inSchoolUsersId = await findAllInSchoolUserId();
    const inBuildingUsersId = (
      await entry.findAll({
        raw: true,
        attributes: ["user_id"],
      })
    ).map((user) => user.user_id);
    const outDoorUsersId = inSchoolUsersId.filter(
      (id) => inBuildingUsersId.indexOf(id) === -1
    );
    const result = await getPeople(outDoorUsersId);

    return result;
  };

  const entrance = async (buildingId) => {
    let transaction = await sequelize.transaction();
    try {
      const entranceData = {
        building_id: buildingId,
        user_id: userId,
      };
      await entry.create(entranceData, {
        transaction,
      });
      await transaction.commit();
      return "success";
    } catch (err) {
      await transaction.rollback();
      throw err;
    }
  };

  const exit = async (buildingId) => {
    let transaction = await sequelize.transaction();
    try {
      //  const entranceData = { building_id: buildingId, user_id: userId };
      await entry.destroy({
        where: {
          building_id: buildingId,
          user_id: userId,
        },
        transaction,
      });
      await transaction.commit();
      return "success";
    } catch (err) {
      await transaction.rollback();
      throw err;
    }
  };

  const getBuildingInUniversity = async (universityId = 1) => {
    const buildingIdList = (
      await building.findAll({
        raw: true,
        nest: true,
        where: {
          university_id: universityId,
        },
      })
    ).map((data) => data.id);
    const result = await Promise.all(
      buildingIdList.map(
        async (buildingId) => await getBuildingData(buildingId)
      )
    );
    return result;
  };

  const getBuildingData = async (buildingId) => {
    const inBuildingUsersId = (
      await entry.findAll({
        raw: true,
        attributes: ["user_id"],
        where: {
          building_id: buildingId,
        },
      })
    ).map((user) => user.user_id);
   
    const people = await getPeople(inBuildingUsersId)

    const buildingData = await building.findOne({
      nest: true,
      raw: true,
      where: {
        id: buildingId,
      },
      attributes: ["latitude", "longitude", "name", "radius"],
    });
    const { latitude, longitude, name, radius } = buildingData;

    const result = {
      id: buildingId,
      name: name,
      coordinate: {
        latitude: latitude,
        longitude: longitude,
      },
      radius: radius,
      people: people,
    };

    return result;
  };

  return {
    getOutDoorUsers,
    getUniversityData,
    getBuildingInUniversity,
    getBuildingData,
    entrance,
    exit,
  };
};

module.exports = GeoFenceService;
