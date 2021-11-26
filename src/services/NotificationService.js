const crypto = require("crypto");
const { default: axios } = require("axios");
const { SENS_SMS, SENS_PUSH } = require("../config/key");
const moment = require("moment-timezone");
const { sequelize, communication } = require("../models");
moment().tz("Asia/Seoul");

const NotificationService = (sender = null) => {
  const pushAccessKey = SENS_PUSH.accessKey;
  const pushServiceId = SENS_PUSH.serviceId;
  const pushSecretKey = SENS_PUSH.secretKey;

  const smsAccessKey = SENS_SMS.accessKey;
  const smsServiceId = SENS_SMS.serviceId;
  const smsSecretKey = SENS_SMS.secretKey;
  const smsSender = SENS_SMS.sender;

  const makeSignature = (url, timestamp, method, secretKey, accessKey) => {
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

    const uri = `https://sens.apigw.ntruss.com/push/v2/services/${pushServiceId}/users`;
    const url = `/push/v2/services/${pushServiceId}/users`;

    const signature = makeSignature(
      url,
      timestamp,
      method,
      pushSecretKey,
      pushAccessKey
    );

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
        "x-ncp-iam-access-key": pushAccessKey,
        "x-ncp-apigw-timestamp": timestamp,
        "x-ncp-apigw-signature-v2": signature.toString(),
      },
    };
    await axios
      .post(uri, body, options)
      .then((res) => {
        console.log(res)
        resultCode = 200;
      })
      .catch((err) => {
      //  console.log(err);
       console.log(err.response.data);
      throw new Error("디바이스 토큰 등록 중 에러 발생")
      });
    console.log(resultCode, sender)
    return resultCode;
  };
  const sendPush = async (receiver, payload) => {
    // User.findOne({where: {profile_id: followeeProfileId}}).then()
    let transaction = await sequelize.transaction();
    try {
      const timestamp = Date.now().toString(); // current timestamp (epoch)

      const uri = `https://sens.apigw.ntruss.com/push/v2/services/${pushServiceId}/messages`;
      const url = `/push/v2/services/${pushServiceId}/users`;
      const method = "POST";
      const signature = makeSignature(
        url,
        timestamp,
        method,
        pushSecretKey,
        pushAccessKey
      );
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
          "x-ncp-iam-access-key": pushAccessKey,
          "x-ncp-apigw-timestamp": timestamp,
          "x-ncp-apigw-signature-v2": signature,
        },
      };
      const communicationData = {
        sender: sender,
        receiver: receiver,
        message: payload,
      };
      await communication.create(communicationData, { transaction });

      await axios
        .post(uri, body, options)
        .then(async (res) => {
          resultCode = 200;
        })
        .catch((err) => {
          console.log(err)
          console.log(err.response.data);
        });
      if (resultCode === 400) {
        throw new Error("푸쉬를 보내는 과정에서 에러가 발생하였습니다.");
      }
      await transaction.commit();
      return "success";
    } catch (err) {
      await transaction.rollback();
      console.log(err);
      throw err;
    }
  };
  const sendSMS = async (receiver, verifyCode) => {
    try {
      let resultCode = 400;
      const timestamp = Date.now().toString(); // current timestamp (epoch)

      const uri = `https://sens.apigw.ntruss.com/sms/v2/services/${smsServiceId}/messages`;
      const url = `/sms/v2/services/${smsServiceId}/messages`;
      const method = "POST";
      const signature = makeSignature(
        url,
        timestamp,
        method,
        smsSecretKey,
        smsAccessKey
      );
      const options = {
        headers: {
          "Content-Type": "application/json; charset=utf-8",
          "x-ncp-iam-access-key": smsAccessKey,
          "x-ncp-apigw-timestamp": timestamp,
          "x-ncp-apigw-signature-v2": signature,
        },
      };
      const body = {
        type: "SMS",
        contentType: "COMM",
        countryCode: "82",
        from: "01051795955",
        content: `[본인 확인] 인증번호 [${verifyCode}]를 입력해주세요.`,
        messages: [
          {
            to: `${receiver}`,
          },
        ],
      };
      await axios
        .post(uri, body, options)
        .then((res) => {
          console.log(res.data);
          resultCode = 200;
        })
        .catch((err) => {
          console.log(err.response.data);
        });
      if (resultCode === 400) {
        throw new Error("sms를 보내는 과정에서 에러가 발생하였습니다.");
      }
      return "success";
    } catch (err) {
      console.log(err);
      throw err;
    }
  };

  return { postDeviceToken, sendPush, sendSMS };
};

module.exports = NotificationService;
