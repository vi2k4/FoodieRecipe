import { Injectable } from '@nestjs/common';
import {
  S3Client,
  PutObjectCommand,
  GetObjectCommand,
} from '@aws-sdk/client-s3';
import sharp from 'sharp';
import { ConfigService } from '@nestjs/config';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
@Injectable()
export class S3Service {
  private s3Client: S3Client;

  constructor(private configService: ConfigService) {
    this.s3Client = new S3Client({
      region: this.configService.getOrThrow<string>('AWS_REGION'),
      credentials: {
        accessKeyId: this.configService.getOrThrow<string>('AWS_ACCESS_KEY_ID'),
        secretAccessKey: this.configService.getOrThrow<string>(
          'AWS_SECRET_ACCESS_KEY',
        ),
      },
    });
  }
  async uploadImage(file: Express.Multer.File, folder: string) {
    // 1. Resize + convert WebP

    const optimizedImage = await sharp(file.buffer)
      .resize({
        width: 1024,
        withoutEnlargement: true,
      })
      .jpeg({
        quality: 85,
      })
      .toBuffer();

    // 2. tạo tên file

    const fileName = `${Date.now()}.jpg`;

    const key = `${folder}/${fileName}`;

    // 3. upload S3

    await this.s3Client.send(
      new PutObjectCommand({
        Bucket: process.env.AWS_BUCKET_NAME,

        Key: key,

        Body: optimizedImage,

        ContentType: 'image/jpeg',
      }),
    );

    // 4. trả URL

    return {
      key,

      url: `https://${process.env.AWS_BUCKET_NAME}.s3.${process.env.AWS_REGION}.amazonaws.com/${key}`,
    };
  }

  async getPresignedUrl(
    key: string,
    expiresIn = 300, // 5 phút
  ): Promise<string> {
    const command = new GetObjectCommand({
      Bucket: this.configService.getOrThrow<string>('AWS_BUCKET_NAME'),
      Key: key,
    });

    return await getSignedUrl(this.s3Client, command, {
      expiresIn,
    });
  }
}
