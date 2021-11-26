const { verifyToken } = require("../../lib/jwt");
const { user } = require("../../models");

module.exports = {
  async checkAccessTokens(req, res, next) {

    const { authorization } = req.headers;
    console.log(req.header);
    const credentials = authorization.replace("Bearer ", "");

    const tokenData = verifyToken(credentials);

    const tokenType = tokenData.type;

    const id = tokenType !== "A" ? "1" : tokenData.userId;
    console.log(id, tokenType);
    const bufferOne = tokenType !== "A" ? "1" : Buffer.from(id);

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
  async checkRefreshTokens(req, res, next) {
    const { authorization } = req.headers;

    const credentials = authorization.replace("Bearer ", "");

    const tokenData = verifyToken(credentials);

    const tokenType = tokenData.type;

    if (tokenType === "E" || tokenType === "N") {
      return res.status(403).send({ error: "접근이 불가능합니다." });
    }

    else {
      const id = tokenType !== "R" ? "1" : tokenData.userId;
      const bufferOne = tokenType !== "R" ? "1" : Buffer.from(id);

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
