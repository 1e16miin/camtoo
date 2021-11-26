const { sequelize, user } = require("../models");
const { jwtSecretKey } = require("../config/key");
const jwt = require("jsonwebtoken");
const TimeTableService = require("./TimeTableService");
const cache = require("memory-cache-ttl")
const NotificationService = require("./NotificationService");

const AuthService = () => {
  
 const createVerifyCode = (n = 4) => {
    let str = "";
    for (let i = 0; i < n; i++) {
      str += Math.floor(Math.random() * 10);
    }
    return str;
  };

  const sendVerifyCode = async (receiver, cache) => {
    
    try {
      const verifyCode = createVerifyCode();
      const notificationInstance = NotificationService();
      
      cache.set(receiver, verifyCode, 180)
      const result = await notificationInstance.sendSMS(receiver, verifyCode);
      console.log(cache);
      return result;
    } catch (err) {
      cache.del(receiver)
      console.log(err);
      throw err;
    }
  }; 
  
  const confirmVerifyCode = async (authData) => {
    const {phoneNumber, verifyCode} = authData
    const cacheData = cache.get(phoneNumber);
    console.log(cache);
    if (!cacheData) {
      return new Error("제한 시간이 초과하였습니다")
    }
    console.log(cacheData)
    if (cacheData !== verifyCode) {
      return new Error("인증 번호가 맞지 않습니다.")
    }

    cache.del(phoneNumber);
    return "success"
  }

  const issueTokens = (id) => {
    const accessToken = jwt.sign({ id: id, type: "A" }, jwtSecretKey, {
      expiresIn: 60 * 60 * 2,
    });

    const refreshToken = jwt.sign({ id: id, type: "R" }, jwtSecretKey, {
      expiresIn: 60 * 60 * 24 * 14,
    });

    const result = { accessToken: accessToken, refreshToken: refreshToken };
    return result;
  };

  const createNewUser = async (signUpData) => {
    let transaction = await sequelize.transaction();
    try {
      const { id, universityId, name, timeTableClasses } = signUpData;
      const userData = {
        id: id,
        university_id: universityId,
        name: name,
      };
      const createdUserData = await user.create(userData, { transaction });
      const userId = createdUserData.dataValues.user_id;
      const timeTableInstance = TimeTableService(userId);
      transaction = await timeTableInstance.create(
        timeTableClasses,
        transaction
      );
      
      await createdUserData.update(
        { refresh_token: result.refreshToken },
        { transaction }
      );
      const result = issueTokens(id);
      await transaction.commit();
      return result;
    } catch (err) {
      console.log(err);
      await transaction.rollback();
      throw new Error("유저 생성 에러");
    }
  };

  return { sendVerifyCode, createNewUser, confirmVerifyCode };
};

module.exports = AuthService;
