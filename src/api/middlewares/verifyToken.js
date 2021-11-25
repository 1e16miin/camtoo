const { verifyToken } = require("../../lib/jwt");
const { user } = require("../../models");

module.exports = {
  async checkAccessToken(req, res, next) {

    const { authorization } = req.headers;

    const credentials = authorization.replace("Bearer ", "");

    const tokenData = verifyToken(credentials);

    const tokenType = tokenData.type;

    const userId = tokenType !== "A" ? null : tokenData.userId;

    const bufferOne = tokenType !== "A" ? null : Buffer.from(userId);

    if (credentials === "null") {
      req.id = null;
      next();
    } else {
      if (tokenType === "E" || tokenType === "N") {
        return res.status(403).send({ error: "접근이 불가능합니다." });
        
      } else {
        if (tokenType === "A") {
          req.id = bufferOne;
          next();
        }

        else if (tokenType === "P") {
          return res
            .status(401)
            .send({ code: 2, error: "access 토큰이 만료되었습니다." });
        }
      }
    }
  },
  async checkRefreshToken(req, res, next) {
    const { authorization } = req.headers;

    const credentials = authorization.replace("Bearer ", "");

    const tokenData = verifyToken(credentials);

    const tokenType = tokenData.type;

    if (tokenType === "E" || tokenType === "N") {
      return res.status(403).send({ error: "접근이 불가능합니다." });
    }

    else {
      const userId =
        tokenType !== "R" ? null : tokenData.userId;
      const bufferOne = tokenType !== "R" ? null : Buffer.from(userId);

      if (tokenType === "R") {
        const checkToken = async () => {
          return user.findOne({nest:true, raw:true, where: { user_id: bufferOne } }).then(
            (data) => {
              if (!data) {
                return false;
              } else {
                if (data.refresh_token === credentials) {
                  return true;
                } else {
                  return false;
                }
              }
            }
          );
        };
        const isSame = await checkToken();

        console.log(isSame);

        if (isSame) {
          req.id = bufferOne;
          next();
        } else {
          //디비의 토큰과 일치하지 않음
          return res
            .status(403)
            .send({ code: 4, message: "유효하지 않은 접근입니다." });
        }
      }
      //엑세스 토큰이 유효하지 않을 때
      else if (tokenType === "P") {
        return res
          .status(401)
          .send({ code: 3, message: "로그인이 필요합니다." });
      }
    }
  },
};
