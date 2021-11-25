const { user } = require("../models");
const TimeTableService = require("./TimeTableService");

const UserService = async (id) => {
  const getUniversityId = (userId) => { };
  
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
    const timeTableClasses = await TimeTableService(userId).getAllSchedules();
    const userData = await user.findOne({
      nest: true,
      raw: true,
      where: { profile_id: userId },
    });
    const {
      profile_id,
      name,
      status,
      promise_refusal_mode,
      public_profile_mode,
      in_school,
      in_building,
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
      timeTableClasses: timeTableClasses,
      coordinate: { latitude: latitude, longitude: longitude },
      inSchool: in_school,
      inBuilding: in_building,
    };
    return result;
  };
  
  const userId = await getUserId()
  // const userData = await getUserData()
  
  return { getUserData, userId };
};

module.exports = UserService