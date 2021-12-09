const {
  building,
  user,
  sequelize,
  entry,
  university,
} = require("../models");
const { Op } = require("sequelize");
const FriendService = require("./FriendService");
const UserService = require("./UserService");
const isInRange = require("../utils/isInRange");

const GeoFenceService = (userId) => {
  const findAllInSchoolUserId = async () => {
    const inSchoolUsers = await user.findAll({ raw: true, nest: true, where: { in_school: 1 } })
    const result = inSchoolUsers.map((userData) => userData.user_id);
    return result
  };

  const getUniversity = async (universityId) => {
    const universityData = await university.findByPk(universityId, {attributes:["latitude", "longitude", "radius"]});
  }
  const getInSchoolUsers = async () => {
    const option = 2
    const friendInstance = FriendService(userId);
    const friendObject = await friendInstance.findById(option);
    const friendIdList = Object.keys(friendObject);
    const inSchoolUsersId = await findAllInSchoolUserId()
    const coordinate1 = await user.findOne({ raw: true, nest: true ,attributes:["latitude", "longitude"], where:{user_id:userId}});
    const inSchoolUsers = await Promise.all(inSchoolUsersId.map(async id => {
      let friendStatus = 0
      if (friendIdList.includes(id)) {
        friendStatus = 2
      }
      
      const userData = (await UserService(id)).userData
      if (friendStatus===0) {
        if (userData.publicProfileMode === 0) return null;
        else {
          const coordinate2 = userData.coordinate
          if (!isInRange(coordinate1, coordinate2)) {
            return null;
          }
        }
      }
      const result = {
        user: userData,
        friendStatus: friendStatus
      }
      return result
    }))

    const result = inSchoolUsers.filter(Boolean);
    
    return result
  }

  const entrance = async (buildingId) => {
    let transaction = await sequelize.transaction()
    try {
      const entranceData = { building_id: buildingId, user_id: userId }
      await entry.create(entranceData, { transaction });
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
       await entry.destroy({ where:{ building_id: buildingId, user_id: userId } ,transaction});
       await transaction.commit();
       return "success";
     } catch (err) {
       await transaction.rollback();
       throw err;
     }
   };

  const getUniversityData = async (universityId=1) => {
    const buildingIdList = (await building.findAll({raw:true, nest:true, where:{university_id:universityId}})).map(data=>data.id)
    const result = await Promise.all(
      buildingIdList.map(async (buildingId) => await getBuildingData(buildingId))
    );
    return result
  }

  const getBuildingData = async (buildingId) => {
    let entries = await getInSchoolUsers();
    const people = entries.filter((userData) => {
      userData.user.buildingId === buildingId;
    });
    if (!buildingId) {
      return people;
    }
    const buildingData = await building.findOne({
      nest: true,
      raw: true,
      where: { id: buildingId },
      attributes: ["latitude", "longitude", "name", "radius"],
    });
    const { latitude, longitude, name, radius } = buildingData;
    
    const result = {
      id: buildingId,
      name: name,
      coordinate: { latitude: latitude, longitude: longitude },
      radius: radius,
      people:people
    }

    return result;
  };

 

  return {getUniversityData,  getBuildingData, entrance, exit };
};

module.exports = GeoFenceService;
