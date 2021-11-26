const { sequelize, user } = require("../models");
const { jwtSecretKey } = require("../config/key");
const jwt = require("jsonwebtoken");
const TimeTableService = require("./TimeTableService");
const nodeCache = require("node-cache");
const NotificationService = require("./NotificationService");

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
      const result = await notificationInstance.sendSMS(receiver, verifyCode);
      nodeCache.del(receiver);
      cache.put(receiver, verifyCode);
      return result;
    } catch (err) {
      console.log(err);
      throw err;
    }
  };

  const issueTokens = (id) => {
    const accessToken = jwt.sign({ id: id, type: "A" }, jwtSecretKey, {
      expiresIn: 60 * 60 * 24 * 7,
    });

    const refreshToken = jwt.sign({ id: id, type: "R" }, jwtSecretKey, {
      expiresIn: 60 * 60 * 24 * 30 * 6,
    });

    const result = { accessToken: accessToken, refreshToken: refreshToken };
    return result;
  };

  const createNewUser = async (signUpData) => {
    let transaction = await sequelize.transaction();
    try {
      const { id, universityId, name, timeTableClasses } = signUpData;
      console.log(name);
      const userData = {
        id: id,
        university_id: universityId,
        name: name,
      };
      const createdUserData = await user.create(userData, { transaction });
      const userId = createdUserData.dataValues.user_id;
      const timeTableInstance = TimeTableService(userId);
      console.log(timeTableClasses);
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

  return { sendVerifyCode, createNewUser };
};

module.exports = AuthService;
