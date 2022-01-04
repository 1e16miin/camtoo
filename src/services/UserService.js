const {
  user,
  entry,
  sequelize,
  building
} = require("../models");
const isInRange = require("../utils/isInRange");
const TimeTableService = require("./TimeTableService");


const UserService = async (id = null) => {
  const getUserId = async () => {
    let result = null
    if (id) {
      const {userId} = await user.findOne({
        nest: true,
        raw: true,
        attributes: ["userId"],
        where: {
          id: id
        },
      });
      result = userId;
    }

    return result;
  }

  const getBestFriend = async () => {
    const query = `SELECT userId, count(userId) AS interactionCount FROM ((SELECT sender as userId FROM communication WHERE receiver = ${userId}) UNION (SELECT receiver as userId FROM communication WHERE sender = ${userId})) AS u WHERE userId != ${userId} GROUP BY userId  ORDER BY interactionCount DESC LIMIT 3`
    const bestFriends = await sequelize.query(query, {
      type: sequelize.QueryTypes.SELECT,
    });
    const result = await Promise.all(bestFriends.map(friendData => getUserData(friendData.userId)))
    return result
  }

  const getHangOuts = async (geoFenceInstance) => {
    const hangouts = await entry.findAll({
      raw: true,
      limit: 3,
      where: {
        userId: userId
      },
      paranoid: false,
      group: ["buildingId"],
      attributes: [
        [sequelize.fn("COUNT", "buildingId"), "visitCount"],
        "buildingId",
      ],
      order: [
        [sequelize.literal("visitCount"), "DESC"]
      ],
    });
    const result = await Promise.all(
      hangouts.map(async (building) => {
        const buildingId = building.buildingId;
        const result = await geoFenceInstance.getBuildingData(buildingId);
        return result;
      })
    );

    return result;
  };

  const getUserData = async (userId) => {
    const timeTableInstance = TimeTableService(userId);
    const schedules = await timeTableInstance.getAllSchedules();
    const userData = await user.findOne({
      nest: true,
      raw: true,
      where: {
        userId: userId
      },
    });
    const buildingObject = (await entry.findOne({
      raw: true,
      nest: true,
      attributes: ["buildingId"],
      where: {
        userId: userId
      },
      order: [
        ["createdAt", "DESC"]
      ]
    }))
    const {
      id,
      name,
      status,
      promiseRefusalMode,
      publicProfileMode,
      inSchool,
      statusMessage,
      latitude,
      longitude,
      profileImageUrl,
    } = userData;

    const result = {
      id: id,
      name: name,
      status: status,
      promiseRefusalMode: promiseRefusalMode === 1 ? true : false,
      publicProfileMode: publicProfileMode === 1 ? true : false,
      statusMessage: statusMessage ? statusMessage : "",
      imageUrl: profileImageUrl ? profileImageUrl : "",
      timeTableClasses: schedules,
      coordinate: {
        latitude: latitude ? latitude : 0.0,
        longitude: longitude ? longitude : 0.0,
      },
      inSchool: inSchool === 1 ? true : false,
      buildingId: buildingObject ? buildingObject.buildingId : null,
    };
    return result;
  };

  const updateLocation = async (coordinate) => {

    let transaction = await sequelize.transaction();
    try {
      const userData = await getUserData(userId)
      const buildingId = userData.buildingId
      const buildingData = await building.findByPk(buildingId, {
        raw: true,
        attributes: ["latitude", "longitude", "radius"]
      })
      if (buildingData) {
         const buildingCoordinate = {
           latitude: buildingData.latitude,
           longitude: buildingData.longitude,
         };
         if (!isInRange(buildingCoordinate, coordinate, buildingData.radius)) {
           await entry.destroy({
             where: {
               buildingId: buildingId,
               userId: userId,
             },
             transaction,
           });
         }
      }
     
      await user.update(coordinate, {
        where: {
          id: id
        },
        transaction
      });
      await transaction.commit()
      return "success"
    } catch (err) {
      await transaction.rollback()
      throw (err)
    }
  }

  const update = async (newUserData) => {
    const transaction = await sequelize.transaction()
    const timeTableInstance = TimeTableService(userId)
    console.log(userId)
    try {
      console.log(newUserData)
      await user.update(newUserData, {
        where: {
          id: id
        },
        transaction
      });
      await timeTableInstance.update(newUserData.timeTableClasses, transaction)
      await transaction.commit()
      return "success"
    } catch (err) {
      await transaction.rollback()
      console.log(err)
      throw new Error("유저 정보를 업데이트 하는 도중 에러가 발생하였습니다.")
    }
  }

  const uploadProfileImage = () => {
    
  }

  const userId = await getUserId();
  //const userData = await getUserData();

  return {
    getUserData,
    userId,
    update,
    updateLocation,
    getHangOuts,
    getBestFriend,
  };
};

module.exports = UserService