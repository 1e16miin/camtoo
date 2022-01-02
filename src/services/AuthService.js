const { sequelize, user } = require("../models");
const { jwtSecretKey } = require("../config/key");
const jwt = require("jsonwebtoken");
const TimeTableService = require("./TimeTableService");
const pm2ClusterCache = require("pm2-cluster-cache");
const NotificationService = require("./NotificationService");

let cache = pm2ClusterCache.init({ storage: "all" });

const AuthService = () => {
  
 const createVerifyCode = (n = 4) => {
    let str = "";
    for (let i = 0; i < n; i++) {
      str += Math.floor(Math.random() * 10);
    }
    return str;
  };

  const sendVerifyCode = async (receiver) => {
    
    try {
      const verifyCode = createVerifyCode();
      const notificationInstance = NotificationService();
      cache.set(receiver, verifyCode, 180 * 1000)
      const result = await notificationInstance.sendSMS(receiver, verifyCode);
      return result;
    } catch (err) {
      cache.del(receiver)
      console.log(err);
      throw err;
    }
  }; 
  
  const confirmVerifyCode = async (authData) => {
    const { phoneNumber, verifyCode, encryptedPhoneNumber } = authData;
 
    let result = { accessToken: ""}
    const cacheData = await cache.get(phoneNumber);
    if (!cacheData) {
      throw new Error("제한 시간이 초과하였습니다")
    }

    if (cacheData !== verifyCode) {
      throw new Error("인증 번호가 맞지 않습니다.");
    }
    const isUser = await user.findOne({ where: { id: encryptedPhoneNumber } });
    if (isUser) {
      result.accessToken = jwt.sign(
        { id: encryptedPhoneNumber, type: "A" },
        jwtSecretKey,
        {
          expiresIn: 60 * 60 * 24 * 30 * 24,
        }
      );
    }
    cache.delete(phoneNumber);
    return result;
  }

  const issueTokens = (id) => {
    const accessToken = jwt.sign({ id: id, type: "A" }, jwtSecretKey, {
      expiresIn: 60 * 60 * 24 * 30 * 24,
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
      const result = issueTokens(id);
      await createdUserData.update(
        { refresh_token: result.refreshToken },
        { transaction }
      );
      
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
