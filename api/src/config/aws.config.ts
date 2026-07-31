export default () => ({
  aws: {
    region: process.env.AWS_REGION,
    bucket: process.env.AWS_BUCKET_NAME,
    accessKey: process.env.AWS_ACCESS_KEY_ID,
    secretKey: process.env.AWS_SECRET_ACCESS_KEY,
  },
});
