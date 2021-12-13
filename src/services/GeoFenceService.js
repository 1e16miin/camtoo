const {
  building,
  user,
  sequelize,
  entry,
  university,
} = require("../models");
const {
  Op
} = require("sequelize");
const FriendService = require("./FriendService");
const UserService = require("./UserService");
const isInRange = require("../utils/isInRange");

const GeoFenceService = (userId) => {

  const findAllInSchoolUserId = async () => {
    const inSchoolUsers = await user.findAll({
      raw: true,
      nest: true,
      where: {
        in_school: 1
      }
    })
    const result = inSchoolUsers.map((userData) => userData.user_id);
    return result
  };

  const getUniversityData = async (universityId) => {
    const result = await university.findByPk(universityId, {
      attributes: ["latitude", "longitude", "radius"]
    });
    return result
  }

  const getOutDoorUsers = async () => {
    const option = 2
    const friendInstance = FriendService(userId);
    const friendObject = await friendInstance.findById(option);
    const friendIdList = Object.keys(friendObject);
    const inSchoolUsersId = await findAllInSchoolUserId()
    const inBuildingUsersId = (await entry.findAll({
      raw: true,
      attributes: ["user_id"]
    })).map(user => user.user_id)
    const outDoorUsersId = inSchoolUsersId.filter(id => inBuildingUsersId.indexOf(id) === -1)
    const coordinate1 = await user.findOne({
      raw: true,
      nest: true,
      attributes: ["latitude", "longitude"],
      where: {
        user_id: userId
      }
    });
    const outDoorUsers = await Promise.all(outDoorUsersId.map(async id => {
      let result = {
        user: userData,
        friendStatus: 0
      }
      if (friendIdList.includes(id)) {
        friendStatus = 2
      } else {
        const userInstance = await UserService();

        const userData = await userInstance.getUserData(id)
        if (userData.publicProfileMode === 0) return null;

        const coordinate2 = userData.coordinate
        if (!isInRange(coordinate1, coordinate2)) return null;
      }

      return result
    }))

    const result = outDoorUsers.filter(Boolean);

    return result
  }

  const entrance = async (buildingId) => {
    let transaction = await sequelize.transaction()
    try {
      const entranceData = {
        building_id: buildingId,
        user_id: userId
      }
      await entry.create(entranceData, {
        transaction
      });
      await transaction.commit()
      return "success"
    } catch (err) {
      await transaction.rollback()
      throw err
    }
  }

  const exit = async (buildingId) => {
    let transaction = await sequelize.transaction();
    try {
      //  const entranceData = { building_id: buildingId, user_id: userId };
      await entry.destroy({
        where: {
          building_id: buildingId,
          user_id: userId
        },
        transaction
      });
      await transaction.commit();
      return "success";
    } catch (err) {
      await transaction.rollback();
      throw err;
    }
  };

  const getBuildingInUniversity = async (universityId = 1) => {
    const buildingIdList = (await building.findAll({
      raw: true,
      nest: true,
      where: {
        university_id: universityId
      }
    })).map(data => data.id)
    const result = await Promise.all(
      buildingIdList.map(async (buildingId) => await getBuildingData(buildingId))
    );
    return result
  }

  const getBuildingData = async (buildingId) => {
    const inBuildingUserIdList = (await entry.findByPk(buildingId, {
      raw: true,
      attributes: ["user_id"]
    })).map(user => user.user_id)
    const coordinate1 = await user.findOne({
      raw: true,
      nest: true,
      attributes: ["latitude", "longitude"],
      where: {
        user_id: userId
      }
    });
    const option = 2
    const friendInstance = FriendService(userId);
    const friendObject = await friendInstance.findById(option);
    const friendIdList = Object.keys(friendObject);
    const people = (Promise.all(inBuildingUserIdList.map(async id => {
      const userInstance = await UserService();
      const userData = await userInstance.getUserData(id)
      let result = {
        user: userData,
        friendStatus: 0
      }
      if (friendIdList.includes(id)) {
        result.friendStatus = 2
      } else {
        if (userData.publicProfileMode === 0) {
          return null
        }
        const coordinate2 = userData.coordinate
        if (!isInRange(coordinate1, coordinate2)) return null
      }
      return result
    }))).filter(Boolean)

    const buildingData = await building.findOne({
      nest: true,
      raw: true,
      where: {
        id: buildingId
      },
      attributes: ["latitude", "longitude", "name", "radius"],
    });
    const {
      latitude,
      longitude,
      name,
      radius
    } = buildingData;

    const result = {
      id: buildingId,
      name: name,
      coordinate: {
        latitude: latitude,
        longitude: longitude
      },
      radius: radius,
      people: people
    }

    return result;
  };



  return {
    getOutDoorUsers,
    getUniversityData,
    getBuildingInUniversity,
    getBuildingData,
    entrance,
    exit,
    getUniversity
  };
};

module.exports = GeoFenceService;
