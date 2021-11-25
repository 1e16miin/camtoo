const { verifyToken } = require("../../lib/jwt");
const { user } = require("../../models");

module.exports = {
  async checkATokens(req, res, next) {

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
  async checkRTokens(req, res, next) {
    const { authorization } = req.headers;

    const token_replaced = authorization.replace("Bearer ", "");

    const userId = verifyToken(token_replaced);

    const token_censor = userId.tokenData.type;

    if (token_censor === "E" || token_censor === "N") {
      return res.status(403).send({ error: "접근이 불가능합니다." });
    }

    else {
      const parse_userId =
        token_censor !== "R" ? "1" : parse(userId.tokenData.userId);
      const bufferOne = token_censor !== "R" ? "1" : Buffer.from(parse_userId);

      if (token_censor === "R") {
        const rtokencensor = async () => {
          return user.findOne({ where: { user_id: bufferOne } }).then(
            (data) => {
              if (!data) {
                return false;
              } else {
                if (data.dataValues.refreshtoken === token_replaced) {
                  return true;
                } else {
                  return false;
                }
              }
            }
          );
        };
        const issamertoken = await rtokencensor();

        console.log(issamertoken);

        if (issamertoken) {
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
      else if (token_censor === "P") {
        return res
          .status(401)
          .send({ code: 3, message: "로그인이 필요합니다." });
      }
    }
  },
};
