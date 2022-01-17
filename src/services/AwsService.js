const {
    S3
} = require('../config/key')
const AWS = require('aws-sdk')

const AwsService = () => {
    const createPresignedUrl = (
        endPoint,
        uuid,
        extension = ""
    ) => {
        const s3Upload = {
            accessKeyId: S3.accessKey,
            secretAccessKey: S3.secretKey,
            region: S3.region,
        };
        AWS.config.update(s3Upload);
        let s3 = new AWS.S3();
        let url = s3.getSignedUrl("putObject", {
            Bucket: S3.bucket,
            Key: `${endPoint}/${uuid}${extension}`, //filename
            Expires: 1000, //time to expire in seconds
        });
        return url;
    }
    const createSignedUrl = (endPoint,
        uuid,
        extension = "") => {

    }
    return {createPresignedUrl, createSignedUrl}
}

module.exports = AwsService