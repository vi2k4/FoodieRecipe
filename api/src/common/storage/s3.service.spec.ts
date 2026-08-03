/* eslint-disable */
import { ServiceUnavailableException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { getSignedUrl as getCloudFrontSignedUrl } from '@aws-sdk/cloudfront-signer';
import { getSignedUrl as getS3SignedUrl } from '@aws-sdk/s3-request-presigner';
import { S3Service } from './s3.service';

jest.mock('@aws-sdk/cloudfront-signer', () => ({
  getSignedUrl: jest.fn(),
}));

jest.mock('@aws-sdk/s3-request-presigner', () => ({
  getSignedUrl: jest.fn(),
}));

describe('S3Service delivery URLs', () => {
  const cloudFrontSigner = jest.mocked(getCloudFrontSignedUrl);
  const s3Signer = jest.mocked(getS3SignedUrl);

  afterEach(() => {
    jest.clearAllMocks();
    jest.useRealTimers();
  });

  function createService(config: Record<string, string | undefined>) {
    const configService = {
      get: jest.fn((key: string) => config[key]),
    } as unknown as ConfigService;

    return new S3Service(configService);
  }

  it('creates a short-lived CloudFront signed URL when configured', async () => {
    jest.useFakeTimers().setSystemTime(new Date('2026-07-31T12:00:00.000Z'));
    cloudFrontSigner.mockReturnValue(
      'https://d111.cloudfront.net/ai-images/m%C3%B3n%20%C4%83n.jpg?signed=true',
    );
    const privateKey = [
      '-----BEGIN PRIVATE KEY-----',
      'test-key',
      '-----END PRIVATE KEY-----',
    ].join('\n');
    const service = createService({
      AWS_REGION: 'ap-southeast-1',
      CLOUDFRONT_DOMAIN: 'https://d111.cloudfront.net/',
      CLOUDFRONT_KEY_PAIR_ID: 'K123',
      CLOUDFRONT_PRIVATE_KEY_BASE64: Buffer.from(privateKey).toString('base64'),
      CLOUDFRONT_URL_EXPIRES_IN: '300',
    });

    const result = await service.getDeliveryUrl('ai-images/món ăn.jpg');

    expect(result).toContain('d111.cloudfront.net');
    expect(cloudFrontSigner).toHaveBeenCalledWith({
      url: 'https://d111.cloudfront.net/ai-images/m%C3%B3n%20%C4%83n.jpg',
      keyPairId: 'K123',
      privateKey,
      dateLessThan: '2026-07-31T12:05:00.000Z',
    });
    expect(s3Signer).not.toHaveBeenCalled();
  });

  it('rejects a partially configured CloudFront integration', async () => {
    const service = createService({
      AWS_REGION: 'ap-southeast-1',
      CLOUDFRONT_DOMAIN: 'd111.cloudfront.net',
    });

    await expect(service.getDeliveryUrl('ai-images/dish.jpg')).rejects.toThrow(
      ServiceUnavailableException,
    );
  });

  it('falls back to an S3 presigned URL when CloudFront is disabled', async () => {
    s3Signer.mockResolvedValue('https://signed-s3.example.com/dish.jpg');
    const service = createService({
      AWS_REGION: 'ap-southeast-1',
      AWS_BUCKET_NAME: 'my-foodie-ai-images',
    });

    const result = await service.getDeliveryUrl('ai-images/dish.jpg', 120);

    expect(result).toBe('https://signed-s3.example.com/dish.jpg');
    expect(s3Signer).toHaveBeenCalledWith(
      expect.anything(),
      expect.anything(),
      { expiresIn: 120 },
    );
    expect(cloudFrontSigner).not.toHaveBeenCalled();
  });
});
