const {
  user,
  entry,
  sequelize,
  building,
  university
} = require("../models");
const isInRange = require("../utils/isInRange");
const TimeTableService = require("./TimeTableService");
const moment = require("moment-timezone");
const {
  v4
} = require('uuid');
const AwsService = require("./AwsService");
const {
  S3
} = require("../config/key");
moment().tz("Asia/Seoul");

const UserService = async (id = null) => {
  const getUserId = async () => {
    let result = null
    if (id) {
      const {
        userId
      } = await user.findOne({
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
    const buildingObject = await entry.findOne({
      raw: true,
      nest: true,
      attributes: ["buildingId"],
      where: {
        userId: userId
      },
      order: [
        ["createdAt", "DESC"]
      ]
    })
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
      profileImageName,
      locationUpdatedAt,
      universityId
    } = userData;
   
    const result = {
      id: id,
      name: name,
      status: status,
      promiseRefusalMode: promiseRefusalMode === 1 ? true : false,
      publicProfileMode: publicProfileMode === 1 ? true : false,
      statusMessage: statusMessage,
      imageUrl: profileImageName,
      timeTableClasses: schedules,
      coordinate: {
        latitude: latitude ? latitude : 0.0,
        longitude: longitude ? longitude : 0.0,
      },
      inSchool: inSchool === 1 ? true : false,
      buildingId: buildingObject ? buildingObject.buildingId : null,
      isLocationUpdated: moment.duration(moment().diff(moment(locationUpdatedAt))).asSeconds() > 15 * 60 ? false : true,
      universityId: universityId
    };
    return result;
  };

  const updateLocation = async (coordinate) => {

    const transaction = await sequelize.transaction();
    try {
      const userData = await getUserData(userId)
      const buildingId = userData.buildingId
      const universityData = await university.findByPk(userData.universityId,{raw:true, attributes: ["latitude", "longitude", "radius"]})
      const universityCoordinate = {
        latitude:universityData.latitude,
        longitude:universityData.longitude
      }
      let inSchool = true
      // if(!isInRange(universityCoordinate, coordinate, universityData.radius)){
      //   inSchool = false
      // }
     
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
      const locationDto = {
        ...coordinate,
        locationUpdatedAt: moment(),
        inSchool: inSchool
      }
      await user.update(locationDto, {
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

  const update = async (updateUserDto) => {
    const transaction = await sequelize.transaction()
    const timeTableInstance = TimeTableService(userId)
    try {
      let updateUser = updateUserDto
      if (updateUserDto.imageUrl !== undefined) {
        const {
          imageUrl,
          ...remainder
        } = updateUserDto
        
          if(imageUrl.startsWith("https://")){
            updateUser = {
              profileImageName: imageUrl,
              ...remainder
            }
          }else{
            updateUser = {
              profileImageName: `${S3.profileImageDirectoryUrl}/${imageUrl}`,
              ...remainder
            }
          }
         
        
      }
      await user.update(updateUser, {
        where: {
          id: id
        },
        transaction
      });
      if (updateUser.timeTableClasses) {
        await timeTableInstance.update(updateUser.timeTableClasses, transaction)
      }

      await transaction.commit()
      return "success"
    } catch (err) {
      await transaction.rollback()
      console.log(err)
      throw new Error("유저 정보를 업데이트 하는 도중 에러가 발생하였습니다.")
    }
  }

  const getUploadProfileImageUrl = () => {
    const uuid = v4()
    const awsInstance = AwsService()
    const imageUploadUrl = awsInstance.createPresignedUrl("profile-image", uuid)
    const result = {
      fileName: uuid,
      imageUploadUrl: imageUploadUrl
    }
    return result
  }

  // const 

  const userId = await getUserId();
  //const userData = await getUserData();

  return {
    getUserData,
    userId,
    update,
    updateLocation,
    getHangOuts,
    getBestFriend,
    getProfileImageUploadUrl: getUploadProfileImageUrl
  };
};

module.exports = UserService