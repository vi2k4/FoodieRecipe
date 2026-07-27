import { Injectable, ServiceUnavailableException } from '@nestjs/common';
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
    const accessKeyId = this.configService.get<string>('AWS_ACCESS_KEY_ID');
    const secretAccessKey = this.configService.get<string>('AWS_SECRET_ACCESS_KEY');
    this.s3Client = new S3Client({
      region: this.configService.get<string>('AWS_REGION') || 'ap-southeast-1',
      ...(accessKeyId && secretAccessKey ? { credentials: { accessKeyId, secretAccessKey } } : {}),
    });
  }
  async uploadImage(file: Express.Multer.File, folder: string) {
    const bucket = this.configService.get<string>('AWS_BUCKET_NAME');
    if (!bucket) throw new ServiceUnavailableException('AWS S3 chưa được cấu hình');
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
        Bucket: bucket,

        Key: key,

        Body: optimizedImage,

        ContentType: 'image/jpeg',
      }),
    );

    // 4. trả URL

    return {
      key,

      url: `https://${bucket}.s3.${this.configService.get<string>('AWS_REGION') || 'ap-southeast-1'}.amazonaws.com/${key}`,
    };
  }

  async getPresignedUrl(
    key: string,
    expiresIn = 300, // 5 phút
  ): Promise<string> {
    const bucket = this.configService.get<string>('AWS_BUCKET_NAME');
    if (!bucket) throw new ServiceUnavailableException('AWS S3 chưa được cấu hình');
    const command = new GetObjectCommand({
      Bucket: bucket,
      Key: key,
    });

    return await getSignedUrl(this.s3Client, command, {
      expiresIn,
    });
  }
}
