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
      const userId = await user.findOne({
        nest: true,
        raw: true,
        attributes: ["user_id"],
        where: {
          id: id
        },
      });
      result = userId.user_id;
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
        user_id: userId
      },
      paranoid: false,
      group: ["building_id"],
      attributes: [
        [sequelize.fn("COUNT", "building_id"), "visitCount"],
        ["building_id", "buildingId"],
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
    console.log(userId, "userId")
    const timeTableInstance = TimeTableService(userId);
    const schedules = await timeTableInstance.getAllSchedules();
    const userData = await user.findOne({
      nest: true,
      raw: true,
      where: {
        user_id: userId
      },
    });
    const buildingObject = (await entry.findOne({
      raw: true,
      nest: true,
      attributes: ["building_id"],
      where: {
        user_id: userId
      },
      order: [
        ["createdAt", "DESC"]
      ]
    }))
    const {
      id,
      name,
      status,
      promise_refusal_mode,
      public_profile_mode,
      in_school,
      status_message,
      latitude,
      longitude,
      profile_image_url,
    } = userData;

    const result = {
      id: id,
      name: name,
      status: status,
      promiseRefusalMode: promise_refusal_mode === 1 ? true : false,
      publicProfileMode: public_profile_mode === 1 ? true : false,
      statusMessage: status_message ? status_message : "",
      imageUrl: profile_image_url ? profile_image_url : "",
      timeTableClasses: schedules,
      coordinate: {
        latitude: latitude ? latitude : 0.0,
        longitude: longitude ? longitude : 0.0,
      },
      inSchool: in_school === 1 ? true : false,
      buildingId: buildingObject ? buildingObject.building_id : null,
    };
    return result;
  };

  const updateLocation = async (coordinate) => {

    let transaction = await sequelize.transaction();
    try {
      const userData = await getUserData(userId)
      const buildingId = userData.buildingId
      console.log(buildingId)
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
               building_id: buildingId,
               user_id: userId,
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
    let transaction = await sequelize.transaction()
    const timeTableInstance = TimeTableService(userId)
    try {
      const {
        name,
        promiseRefusalMode,
        publicProfileMode,
        statusMessage,
        imageUrl,
        coordinate,
        inSchool,
        timeTableClasses,
      } = newUserData;

      const updatedUserData = {
        name: name,
        promise_refusal_mode: promiseRefusalMode,
        public_profile_mode: publicProfileMode,
        status_message: statusMessage,
        profile_image_url: imageUrl,
        latitude: coordinate.latitude,
        longitude: coordinate.longitude,
        in_school: inSchool,
      };
      // console.log(newUserData)
      await user.update(updatedUserData, {
        where: {
          id: id
        },
        transaction
      });
      // console.log(updatedUserData);
      transaction = await timeTableInstance.update(timeTableClasses, transaction)
      await transaction.commit()
      return "success"
    } catch (err) {
      await transaction.rollback()
      console.log(err)
      throw new Error("유저 정보를 업데이트 하는 도중 에러가 발생하였습니다.")
    }
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