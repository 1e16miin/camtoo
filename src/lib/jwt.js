const jwt = require("jsonwebtoken");

const { jwtSecretKey } = require("../config/key");

//토큰을 header, payload, signature로 풀어주는 친구

module.exports = {
  verifyToken(token) {
    try {
      if (token) {
        return jwt.verify(token, jwtSecretKey);
      }
      else {
        return { type: "N" } ;
      }
    } catch (err) {
      if (err.message === "jwt expired") {
        return { type: "P" } ;
      } else {

        return { type: "E" };
      }
    }
  },
};
