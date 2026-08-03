# CloudFront setup for FoodieRecipe

FoodieRecipe uploads images directly from the API to S3. CloudFront is used only
for private image delivery. The database continues to store the original S3 URL,
so enabling CloudFront does not require a database migration.

## Request flow

1. The API checks whether the caller may view the recipe or AI history.
2. The API signs a CloudFront URL that is valid for 5 minutes by default.
3. CloudFront validates the signature.
4. On a cache hit, CloudFront returns the cached image. On a cache miss, it reads
   the object from the private S3 bucket through Origin Access Control (OAC),
   caches it, and returns it.

Uploads and Amazon Rekognition continue to use S3 directly.

## 1. Create the CloudFront distribution and OAC

In the AWS CloudFront console:

1. Create a standard distribution.
2. Select `my-foodie-ai-images` as a regular S3 bucket origin. Do not select the
   S3 website endpoint.
3. Create an Origin Access Control with signing behavior **Always sign** and
   attach it to the S3 origin.
4. Set the viewer protocol policy to **Redirect HTTP to HTTPS**.
5. Allow only `GET` and `HEAD` for the image behavior.
6. Use the managed `CachingOptimized` cache policy. Image keys in this project
   contain a timestamp and are immutable, so a long cache TTL is appropriate.

Keep S3 Block Public Access enabled.

## 2. Add the S3 bucket policy

Replace `AWS_ACCOUNT_ID` and `DISTRIBUTION_ID`, then apply this policy to the
bucket. Merge it with existing required statements instead of deleting them.

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Sid": "AllowCloudFrontServicePrincipalReadOnly",
      "Effect": "Allow",
      "Principal": {
        "Service": "cloudfront.amazonaws.com"
      },
      "Action": "s3:GetObject",
      "Resource": "arn:aws:s3:::my-foodie-ai-images/*",
      "Condition": {
        "StringEquals": {
          "AWS:SourceArn": "arn:aws:cloudfront::AWS_ACCOUNT_ID:distribution/DISTRIBUTION_ID"
        }
      }
    }
  ]
}
```

The IAM identity used by the API still needs `s3:PutObject` for uploads, and
Amazon Rekognition still needs the existing access required to read the object.

## 3. Create a trusted key group

Generate a 2048-bit RSA key pair. Keep the private key outside source control.

```powershell
openssl genrsa -out cloudfront_private_key.pem 2048
openssl rsa -pubout -in cloudfront_private_key.pem -out cloudfront_public_key.pem
```

In CloudFront:

1. Upload `cloudfront_public_key.pem` under **Public keys**.
2. Create a **Key group** containing that public key.
3. Edit the image cache behavior, enable **Restrict viewer access**, select
   **Trusted key groups**, and attach the new key group.

Convert the private key to Base64 for the backend environment variable:

```powershell
[Convert]::ToBase64String([IO.File]::ReadAllBytes("cloudfront_private_key.pem"))
```

Never commit the generated PEM files or the Base64 private key.

## 4. Configure the applications

Add these values to `api/.env`:

```env
CLOUDFRONT_DOMAIN=dxxxxxxxxxxxxx.cloudfront.net
CLOUDFRONT_KEY_PAIR_ID=KXXXXXXXXXXXXX
CLOUDFRONT_PRIVATE_KEY_BASE64=the_base64_private_key
CLOUDFRONT_URL_EXPIRES_IN=300
```

Add the distribution hostname to `web/.env.local`:

```env
NEXT_PUBLIC_CLOUDFRONT_DOMAIN=dxxxxxxxxxxxxx.cloudfront.net
```

Restart both applications because the Next.js image allowlist is read at build
or startup time. If every CloudFront backend variable is absent, the API falls
back to the existing S3 presigned URL flow. If only some CloudFront variables
are set, the API rejects image delivery rather than silently weakening access.

## 5. Verify

1. Upload an image and confirm that S3 still receives it.
2. Fetch a recipe and confirm its image URL uses the CloudFront hostname and has
   `Expires`, `Signature`, and `Key-Pair-Id` query parameters.
3. Open the signed URL and confirm the image loads.
4. Remove the signature parameters and confirm CloudFront returns `403`.
5. Open the direct S3 URL without an S3 signature and confirm S3 returns `403`.
6. Request the image again and inspect CloudFront response headers or metrics to
   confirm cache behavior.
