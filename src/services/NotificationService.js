const crypto = require("crypto");
const { default: axios } = require("axios");
const { SENS_SMS, SENS_PUSH } = require("../config/key");
const moment = require("moment-timezone");
moment().tz("Asia/Seoul");

const NotificationService = (userId) => {
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
  // const sendPermissionPush = async (profileId, permissionStatus) => {
  // // User.findOne({where: {profile_id: followeeProfileId}}).then()
  // const timestamp = Date.now().toString(); // current timestamp (epoch)
  // const NCP_serviceID = sens_push_test.serviceID;
  // const NCP_accessKey = sens_push_test.AccessKey;
  // const NCP_secretKey = sens_push_test.secretKey;
  // const uri = `https://sens.apigw.ntruss.com/push/v2/services/${NCP_serviceID}/messages`;

  // const signature = makeSignature();
  // const message = `업로드된 영상이 ${permissionStatus === "A" ? "승인대기" : permissionStatus === "B" ? "승인" : "반려"} 되었습니다.`;
  // let resultCode = 400;
  // const alarm_count = await Alarm_app.count({
  //   where: { profile_id: profileId, iswatched: false },
  // });

  // const body = {
  //   messageType: "NOTIF",
  //   target: {
  //     type: "USER",
  //     deviceType: null,
  //     to: [`${profileId}`],
  //     // country: ["string", "string"],
  //   },
  //   message: {
  //     default: {},
  //   },
  //   message: {
  //     default: {},
  //     apns: {
  //       content: message,
  //       option: {
  //         "aps.badge": alarm_count,
  //         "aps.sound": "default",
  //       },
  //       // content: message,
  //     },
  //     fcm: {
  //       content: message,
  //       // options: {
  //       //   "message": message,
  //       //   "channelId": "com.uaround.piopik",
  //       //   "sound": null,
  //       // },
  //     },
  //   },
  // };
  // const options = {
  //   headers: {
  //     "Content-Type": "application/json; charset=utf-8",
  //     "x-ncp-iam-access-key": NCP_accessKey,
  //     "x-ncp-apigw-timestamp": timestamp,
  //     "x-ncp-apigw-signature-v2": signature,
  //   },
  // };
  // // console.log(signature)
  // await axios
  //   .post(uri, body, options)
  //   .then(async (res) => {
  //     resultCode = 200;
  //     // console.log(res)
  //   })
  //   .catch((err) => {
  //     console.log(err);
  //   });

  //   return resultCode;
  // } 
  const sendSMS = async (payload) => {};
  // const
  return { postDeviceToken, sendPush, sendSMS };
};

module.exports = NotificationService