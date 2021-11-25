const { user, entry } = require("../models");
const TimeTableService = require("./TimeTableService");

const UserService = async (id) => {
  const getUserId = async () => {
    const userId = await user.findOne({
      nest: true,
      raw: true,
      attributes: ["user_id"],
      where: { id: id },
    });
    const result = userId.user_id;
    return result;
  }
  const getUserData = async (userId) => {
    const schedules = await TimeTableService(userId).getAllSchedules();
    const userData = await user.findOne({
      nest: true,
      raw: true,
      where: { profile_id: userId },
    });
    const buildingObject = (await entry.findOne({raw:true, nest:true, attributes:["building_id"],where:{user_id:userId}, order:[["createdAt", "DESC"]]}))
    const {
      profile_id,
      name,
      status,
      promise_refusal_mode,
      public_profile_mode,
      in_school,
      status_message,
      profile_image_url,
    } = userData;
    // timeTableClasses
    const result = {
      id: profile_id,
      name: name,
      status: status,
      promiseRefusalMode: promise_refusal_mode,
      publicProfileMode: public_profile_mode,
      statusMessage: status_message,
      imageUrl: profile_image_url,
      schedule: schedules,
      coordinate: { latitude: latitude, longitude: longitude },
      inSchool: in_school,
      buildingId: buildingObject ? buildingObject.building_id : null,
    };
    return result;
  };
  
  const userId = await getUserId()
  // const userData = await getUserData()
  
  return { getUserData, userId };
};

module.exports = UserService