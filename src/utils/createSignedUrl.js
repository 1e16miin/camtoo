const moment = require("moment-timezone");
moment().tz("Asia/Seoul");

const { awsconfig, cf_replaced_domain } = require("../keys");

const cf = require("aws-cloudfront-sign");

const createSignedUrl = (route, uuid, type = "") => {
  
    let signedUrl = null;
    if (uuid) {
      let signingParams = {
        keypairId: awsconfig.cloudfrontaccesskey,
        privateKeyString: awsconfig.cloudfrontsecretkey,
        // Optional - this can be used as an alternative to privateKeyString
        // privateKeyPath: '/path/to/private/key',
        expireTime: moment().add(1, "hours"),
      };

      signedUrl = cf.getSignedUrl(
        `https://${cf_replaced_domain}/${route}/${uuid}${type}`,
        signingParams
      );
    }

    return signedUrl;
 
};

module.exports = createSignedUrl;