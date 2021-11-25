const jwt = require("jsonwebtoken");

const { jwtSecretKey } = require("../config/key");

//토큰을 header, payload, signature로 풀어주는 친구

module.exports = {
  verifyToken(token) {
    console.log(token)
    try {
      if (token) {
        return { token_data: jwt.verify(token, jwtSecretKey) };
      }
      else {
        return { token_data: { type: "N" } };
      }
    } catch (err) {


      if (err.message === "jwt expired") {
        return { token_data: { type: "P" } };
      } else {

        return { token_data: { type: "E" } };
      }
    }
  },
};
