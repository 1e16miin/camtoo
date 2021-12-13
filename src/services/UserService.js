const { user, entry, sequelize } = require("../models");
const TimeTableService = require("./TimeTableService");


const UserService = async (id=null) => {
  const getUserId = async () => {
    let result = null
    if(id){
      const userId = await user.findOne({
        nest: true,
        raw: true,
        attributes: ["user_id"],
        where: { id: id },
      });
      result = userId.user_id;
    }
    
    return result;
  }

  
  const getUserData = async (userId) => {
    const schedules = await TimeTableService(userId).getAllSchedules();
    const userData = await user.findOne({
      nest: true,
      raw: true,
      where: { user_id: userId },
    });
    const buildingObject = (await entry.findOne({raw:true, nest:true, attributes:["building_id"],where:{user_id:userId}, order:[["createdAt", "DESC"]]}))
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
      await user.update(coordinate, { where: { id: id }, transaction });
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
      await user.update(updatedUserData, { where: { id: id }, transaction });
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

  return { getUserData, userId, update, updateLocation };
};

module.exports = UserService