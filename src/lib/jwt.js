const jwt = require("jsonwebtoken");

const { secretKey } = require("../config/key");

//토큰을 header, payload, signature로 풀어주는 친구

module.exports = {
  verifyToken(token) {
    //토큰 만료됐을 경우에도 경우의 수 따져줘야함.

    try {
      if (token) {
        return { token_data: jwt.verify(token, secretKey) };
      }
      //토큰 값이 없을 수 없음. 앞에서 authorization에 어떤 값이 없으면 애초에 필터링을 해버림
      else {
        return { token_data: { type: "N" } };
      }
    } catch (err) {
      // console.log(err)

      if (err.message === "jwt expired") {
        return { token_data: { type: "P" } };
      } else {
        // console.log(err)

        return { token_data: { type: "E" } };
      }

      // err.name TokenExpiredError
      // err.message jwt expired
    }
  },
};
