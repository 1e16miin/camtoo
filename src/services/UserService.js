const { user } = require("../models");
const TimeTableService = require("./TimeTableService");

const UserService = (profileId) => {
  const getUniversityId = () => {};

  const getUserData = async () => {
    const timeTableClasses = await TimeTableService(profileId).getAllSchedules();
    const userData = await user.findOne({
      nest: true,
      raw: true,
      where: { profile_id: profileId },
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
  
  // const userData = await getUserData()

  return { getUserData };
};

module.exports = UserService