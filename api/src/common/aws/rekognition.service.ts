import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

import {
  RekognitionClient,
  DetectLabelsCommand,
  DetectLabelsCommandOutput,
} from '@aws-sdk/client-rekognition';

@Injectable()
export class RekognitionService {
  private readonly client: RekognitionClient;

  constructor(private readonly configService: ConfigService) {
    this.client = new RekognitionClient({
      region: this.configService.getOrThrow<string>('AWS_REGION'),
      credentials: {
        accessKeyId: this.configService.getOrThrow<string>('AWS_ACCESS_KEY_ID'),
        secretAccessKey: this.configService.getOrThrow<string>(
          'AWS_SECRET_ACCESS_KEY',
        ),
      },
    });
  }

  async detectLabels(imageKey: string): Promise<DetectLabelsCommandOutput> {
    const command = new DetectLabelsCommand({
      Image: {
        S3Object: {
          Bucket: this.configService.getOrThrow<string>('AWS_BUCKET_NAME'),
          Name: imageKey,
        },
      },

      MaxLabels: 30,

      MinConfidence: 50,
    });

    return await this.client.send(command);
  }
}
