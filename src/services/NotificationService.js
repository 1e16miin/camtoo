const crypto = require("crypto");
const { default: axios } = require("axios");
const { SENS_SMS, SENS_PUSH } = require("../config/key");
const moment = require("moment-timezone");
moment().tz("Asia/Seoul");

const NotificationService = (userId) => {
  const makeSignature = (url, timestamp, method) => {
    const space = " "; // one space
    const newLine = "\n"; // new line
    const accessKey = SENS_PUSH.accessKey;
    const secretKey = SENS_PUSH.secretKey;
    let message = [];
    let hmac = crypto.createHmac("sha256", secretKey);

    message.push(method);
    message.push(space);
    message.push(url);
    message.push(newLine);
    message.push(timestamp);
    message.push(newLine);
    message.push(accessKey);
    const result = hmac.update(message.join("")).digest("base64");
    return result;
  };

  const postDeviceToken = async (deviceToken) => {
    let resultCode = 400;
    const timestamp = Date.now().toString();
    const accessKey = SENS_PUSH.accessKey;
    const serviceId = SENS_PUSH.serviceId;

    const method = "POST";

    const uri = `https://sens.apigw.ntruss.com/push/v2/services/${serviceId}/users`;
    const url = `/push/v2/services/${serviceId}/users`;

    const signature = makeSignature(url, timestamp, method);
    const body = {
      userId: userId,
      channelName: "default",
      deviceType: "GCM",
      deviceToken: deviceToken,
      isNotificationAgreement: true,
      isAdAgreement: true,
      isNightAdAgreement: false,
    };

    const options = {
      headers: {
        "Content-Type": "application/json; charset=utf-8",
        "x-ncp-iam-access-key": accessKey,
        "x-ncp-apigw-timestamp": timestamp,
        "x-ncp-apigw-signature-v2": signature.toString(),
      },
    };
    await axios
      .post(uri, body, options)
      .then(async (res) => {
        resultCode = 200;
      })
      .catch((err) => {
        console.log(err);
        // throw new Error("디바이스 토큰 등록 중 에러 발생")
      });

    return resultCode;
  };
  const send = async (payload) => {};
  // const
  return {postDeviceToken, send}
};

module.exports = NotificationService