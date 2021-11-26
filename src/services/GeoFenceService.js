const {
  boundary,
  building,
  member,
  friend,
  user,
  sequelize,
  university,
} = require("../models");
const { Op } = require("sequelize");
const FriendService = require("./FriendService");
const UserService = require("./UserService");
const distance = require("../utils/distance");
const isInRange = require("../utils/distance");

const GeoFenceService = (userId) => {
  const friendInstance = FriendService(userId);
  

  const findAllInSchoolUserId = async () => {
    const inSchoolUsers = await user.findAll({ raw: true, nest: true, where: { in_school: 1 } })
    const result = inSchoolUsers.map((userData) => userData.user_id);
    return result
  };

  const getInSchoolUsers = async () => {
    const friendIdList = await friendInstance.findById();
    const inSchoolUsersId = await findAllInSchoolUserId()
    const coordinate1 = await user.findOne({ raw: true, nest: true ,attributes:["latitude", "longitude"], where:{user_id:userId}});
    const inSchoolUsers = await Promise.all(inSchoolUsersId.map(async id => {
      let isFriend = false
      if (friendIdList.includes(id)) {
        isFriend = true
      }
      
      const userData = await (await UserService(id)).getUserData();
      if (!isFriend) {
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
        isFriend: isFriend
      }
      return result
    }))

    const result = inSchoolUsers.filter(Boolean);
    
    return result
  }

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
      buildingId: buildingId,
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
