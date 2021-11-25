const crypto = require("crypto");
const { default: axios } = require("axios");
const { SENS_SMS, SENS_PUSH } = require("../config/key");
const moment = require("moment-timezone");
const { sequelize, communication } = require("../models");
moment().tz("Asia/Seoul");

const NotificationService = (sender) => {
  const accessKey = SENS_PUSH.accessKey;
  const serviceId = SENS_PUSH.serviceId;
  const secretKey = SENS_PUSH.secretKey;

  const makeSignature = (url, timestamp, method) => {
    const space = " "; // one space
    const newLine = "\n"; // new line

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

    const method = "POST";

    const uri = `https://sens.apigw.ntruss.com/push/v2/services/${serviceId}/users`;
    const url = `/push/v2/services/${serviceId}/users`;

    const signature = makeSignature(url, timestamp, method);

    const body = {
      userId: sender,
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
  const sendPush = async (receiver, payload) => {
    // User.findOne({where: {profile_id: followeeProfileId}}).then()
    let transaction = sequelize.transaction();
    try {
      const timestamp = Date.now().toString(); // current timestamp (epoch)

      const uri = `https://sens.apigw.ntruss.com/push/v2/services/${serviceId}/messages`;

      const signature = makeSignature(uri, timestamp, "POST");
      let resultCode = 400;

      const body = {
        messageType: "NOTIF",
        target: {
          type: "USER",
          deviceType: null,
          to: [`${receiver}`],
        },
        message: {
          default: {},
        },
        message: {
          default: {},

          fcm: {
            content: payload,
          },
        },
      };
      const options = {
        headers: {
          "Content-Type": "application/json; charset=utf-8",
          "x-ncp-iam-access-key": accessKey,
          "x-ncp-apigw-timestamp": timestamp,
          "x-ncp-apigw-signature-v2": signature,
        },
      };
      const communicationData = {
        sender: sender,
        receiver: receiver,
        message: payload,
      };
      await communication.create(communicationData, {transaction});

      await axios
        .post(uri, body, options)
        .then(async (res) => {
          resultCode = 200;
        })
        .catch((err) => {
          console.log(err);
        });

      await transaction.commit();
      return resultCode;
    } catch (err) {
      await transaction.rollback();
      console.log(err);
      throw new Error("푸쉬를 보내는 과정에서 에러가 발생하였습니다.");
    }
  };
  const sendSMS = async (payload) => {
    
  };
  // const
  return { postDeviceToken, sendPush, sendSMS };
};

module.exports = NotificationService;
