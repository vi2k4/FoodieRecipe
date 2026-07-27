import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

import {
  BedrockRuntimeClient,
  ConverseCommand,
  ConversationRole,
} from '@aws-sdk/client-bedrock-runtime';

@Injectable()
export class BedrockService {
  private readonly client: BedrockRuntimeClient;

  constructor(private readonly config: ConfigService) {
    this.client = new BedrockRuntimeClient({
      region: this.config.getOrThrow<string>('AWS_REGION'),

      credentials: {
        accessKeyId: this.config.getOrThrow<string>('AWS_ACCESS_KEY_ID'),
        secretAccessKey: this.config.getOrThrow<string>(
          'AWS_SECRET_ACCESS_KEY',
        ),
      },
    });
  }

  async generateRecipe(prompt: string): Promise<string> {
    const command = new ConverseCommand({
      modelId: this.config.getOrThrow<string>('BEDROCK_MODEL_ID'),

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

    return response.output?.message?.content?.[0]?.text ?? '';
  }
}
