const { sequelize, user } = require("../models")
const { jwtSecretKey } = require("../config/key")
const jwt = require('jsonwebtoken')
const TimeTableService = require("./TimeTableService")
const { v4: uuidv4, parse, stringify } = require("uuid");

const AuthService = () => {
  const issueTokens = (id) => {
    const accessToken = jwt.sign(
      { userId: stringify(id), type: "A" },
      jwtSecretKey,
      { expiresIn: 60 * 60 * 24 * 7 }
    );
    const refreshToken = jwt.sign(
      { userId: stringify(id), type: "R" },
      jwtSecretKey,
      { expiresIn: 60 * 60 * 24 * 30 * 6 }
    );
    const result = { accessToken: accessToken, refreshToken: refreshToken };
    return result;
  }

  const createNewUser = async (signUpData) => {
    let transaction = await sequelize.transaction();
    try {
      const { id, universityId, name, timeTableClasses } = signUpData;
      const userData = {
        id:id,
        university_id: universityId,
        name:name
      };
      const createdUserData = await user.create(userData, {transaction});
      const userId = createdUserData.dataValues.user_id
      const timeTableInstance = TimeTableService(userId);
      transaction = await timeTableInstance.create(timeTableClasses, transaction);
      const result = issueTokens(id)
      await createdUserData.update({ refresh_token: result.refreshToken}, {transaction});
      await transaction.commit()
      return result;
    } catch (err) {
      console.log(err)
      await transaction.rollback();
      throw new Error("유저 생성 에러")
    }
  }
  
  return { createNewUser };
}

module.exports = AuthService