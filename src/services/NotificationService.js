const crypto = require("crypto");
const axios = require("axios");
const {
  SENS_SMS,
  SENS_PUSH
} = require("../config/key");
const moment = require("moment-timezone");
const UserService = require("./UserService");

const superagent = require("superagent");

moment().tz("Asia/Seoul");

const NotificationService = (sender = null) => {
  const pushAccessKey = SENS_PUSH.accessKey;
  const pushServiceId = SENS_PUSH.serviceId;
  const pushSecretKey = SENS_PUSH.secretKey;

  const smsAccessKey = SENS_SMS.accessKey;
  const smsServiceId = SENS_SMS.serviceId;
  const smsSecretKey = SENS_SMS.secretKey;
  // const smsSender = SENS_SMS.sender;

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

  // const findDeviceToken = async () => {
  //   const uri = `https://sens.apigw.ntruss.com/push/v2/services/${pushServiceId}/users/${sender}`;
  //   const url = `/push/v2/services/${pushServiceId}/users/${sender}`;

  //   const signature = makeSignature(
  //     url,
  //     timestamp,
  //     method,
  //     pushSecretKey,
  //     pushAccessKey
  //   );
  //   const options = {
  //     headers: {
  //       "x-ncp-iam-access-key": pushAccessKey,
  //       "x-ncp-apigw-timestamp": timestamp,
  //       "x-ncp-apigw-signature-v2": signature,
  //     },
  //   };
  // }

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
        "x-ncp-apigw-signature-v2": signature,
      },
    };
    await axios
      .post(uri, body, options)
      .then((res) => {
        resultCode = 200;
      })
      .catch((err) => {
        //  console.log(err);
        console.log(err.response.data);
        throw new Error("???????????? ?????? ?????? ??? ?????? ??????")
      });
    return resultCode;
  };

  const sendPush = async (receiverId, message, type) => {
    try {
      // console.log(receiver)
      const userInstance = await UserService()
      const senderDto = await userInstance.getUserData(sender)
      const timestamp = Date.now().toString(); // current timestamp (epoch)
      const content = {
        receiver: senderDto,
        payload: message,
        type: type,
      };
      // console.log(JSON.stringify(content));
      const uri = `https://sens.apigw.ntruss.com/push/v2/services/${pushServiceId}/messages`;
      const url = `/push/v2/services/${pushServiceId}/messages`;
      const method = "POST";
      const signature = makeSignature(
        url,
        timestamp,
        method,
        pushSecretKey,
        pushAccessKey
      );
      let resultCode = 400;
      // console.log(receiverId)
      let body = {
        messageType: "NOTIF",
        target: {
          type: "USER",
          deviceType: "GCM",
          to: [`${receiverId}`, ],
        },
        message: {
          default: {},

          gcm: {
            content: JSON.stringify(content),
            // content: content
          },
        },
      };
      // console.log(body)

      const headers = {
        "Content-Type": "application/json; charset=utf-8",
        "x-ncp-iam-access-key": pushAccessKey,
        "x-ncp-apigw-timestamp": timestamp,
        "x-ncp-apigw-signature-v2": signature,
      }

      await superagent.post(uri).send(body).set(headers).then(res => {
        resultCode = 200;
      }).catch(err => console.log(err))
      
      if (resultCode === 400) {
        throw new Error("????????? ????????? ???????????? ????????? ?????????????????????.");
      }

      return "success";
    } catch (err) {
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
        content: `[?????? ??????] ???????????? [${verifyCode}]??? ??????????????????.`,
        messages: [{
          to: `${receiver}`,
        }, ],
      };

      await axios
        .post(uri, body, options)
        .then((res) => {
          resultCode = 200;
        })
        .catch((err) => {
          console.log(err.response.data);
        });
      if (resultCode === 400) {
        throw new Error("sms??? ????????? ???????????? ????????? ?????????????????????.");
      }
      return "success";
    } catch (err) {
      console.log(err);
      throw err;
    }
  };

  return {
    postDeviceToken,
    sendPush,
    sendSMS
  };
};

module.exports = NotificationService;