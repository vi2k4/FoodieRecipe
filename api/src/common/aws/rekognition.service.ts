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
      region: this.configService.get<string>('AWS_REGION') || 'ap-southeast-1',
      ...(this.configService.get<string>('AWS_ACCESS_KEY_ID') && this.configService.get<string>('AWS_SECRET_ACCESS_KEY')
        ? {
            credentials: {
              accessKeyId: this.configService.get<string>('AWS_ACCESS_KEY_ID')!,
              secretAccessKey: this.configService.get<string>('AWS_SECRET_ACCESS_KEY')!,
            },
          }
        : {}),
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
