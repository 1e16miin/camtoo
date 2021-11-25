const { verifyToken } = require("../../lib/jwt");

const { parse } = require("uuid");



module.exports = {
  async checkATokens(req, res, next) {
    // const rtoken = req.cookies.rtoken

    //헤더에는 access토큰이 있거나 없거나임.

    const { authorization } = req.headers;

    const token_replaced = authorization.replace("Bearer ", "");

    const userId = verifyToken(token_replaced);

    const token_censor = userId.token_data.type;

    const parse_userId =
      token_censor !== "A" ? "1" : parse(userId.token_data.userId);

    const bufferOne = token_censor !== "A" ? "1" : Buffer.from(parse_userId);

    // 엑세스 토큰이 없을 때
    // 유효하지 않은 접근
    // 기간이 만료된 토큰을 갖고 있어도 null로 반환하지는 않음.

    if (token_replaced === "null") {
      req.id = null;
      next();
    } else {
      if (token_censor === "E" || token_censor === "N") {
        //코드번호 다른 걸로 바꾸기
        //400 bad request
        //401 unauthorized 다시 인증 가능
        //402 payment required
        //403 forbidden 다시 인증 불가(인증 시도 다시 해도 불가능)
        //404 not found
        return res.status(403).send({ error: "접근이 불가능합니다." });
        // throw Error('API 사용 권한이 없습니다.');
      } else {
        //엑세스 토큰이 유효할 때

        if (token_censor === "A") {
          // console.log(' access 토큰이 유효합니다. ')

          req.id = bufferOne;
          next();
        }

        //엑세스 토큰이 유효하지 않을 때
        else if (token_censor === "P") {
          // console.log(' access 토큰이 유효하지 않습니다. refresh 토큰을 보내주세요 ')

          return res
            .status(401)
            .send({ code: 2, error: "access 토큰이 만료되었습니다." });
        }
      }
    }
  },
};
