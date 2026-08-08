import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

import {
  BedrockRuntimeClient,
  ConverseCommand,
  ConversationRole,
} from '@aws-sdk/client-bedrock-runtime';

@Injectable()
export class BedrockService {
  private readonly logger = new Logger(BedrockService.name);
  private readonly client: BedrockRuntimeClient;
  private readonly region: string;

  constructor(private readonly config: ConfigService) {
    // Bedrock có thể dùng credentials của một AWS account riêng.
    // Không dùng AWS_ACCESS_KEY_ID/AWS_SECRET_ACCESS_KEY chung với S3
    // và Rekognition của EC2.
    const accessKeyId = this.config.get<string>(
      'BEDROCK_AWS_ACCESS_KEY_ID',
    );
    const secretAccessKey = this.config.get<string>(
      'BEDROCK_AWS_SECRET_ACCESS_KEY',
    );

    this.region =
      this.config.get<string>('BEDROCK_REGION') ||
      this.config.get<string>('AWS_REGION') ||
      'ap-southeast-1';

    this.client = new BedrockRuntimeClient({
      region: this.region,
      ...(accessKeyId && secretAccessKey
        ? {
            credentials: {
              accessKeyId,
              secretAccessKey,
            },
          }
        : {}),
    });
  }

  async generateRecipe(prompt: string): Promise<string> {
    const modelId = this.config.getOrThrow<string>('BEDROCK_MODEL_ID');

    const command = new ConverseCommand({
      modelId,

      messages: [
        {
          role: ConversationRole.USER,
          content: [
            {
              text: prompt,
            },
          ],
        },
      ],

      inferenceConfig: {
        maxTokens: 1500,
        temperature: 0.7,
      },
    });

    const response = await this.client.send(command);

    const usage = response.usage;
    this.logger.log(
      `[Bedrock] model=${modelId} region=${this.region} ` +
        `inputTokens=${usage?.inputTokens ?? 0} ` +
        `outputTokens=${usage?.outputTokens ?? 0} ` +
        `totalTokens=${usage?.totalTokens ?? 0}`,
    );

    return response.output?.message?.content?.[0]?.text ?? '';
  }
}
