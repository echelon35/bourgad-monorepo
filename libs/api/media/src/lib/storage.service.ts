import { Injectable } from '@nestjs/common';
import { S3Client, PutObjectCommand, ObjectCannedACL } from '@aws-sdk/client-s3';
import { ConfigService } from '@nestjs/config';
import 'multer';

@Injectable()
export class StorageService {
  private readonly s3Client: S3Client;
  private readonly bucketName: string;

  private readonly region: string;
  private readonly endpoint: string;

  constructor(private configService: ConfigService) {
    const bucketName = this.configService.get<string>('SCW_BUCKET_NAME');
    const region = this.configService.get<string>('SCW_REGION');
    const endpoint = this.configService.get<string>('SCW_ENDPOINT');
    const accessKeyId = this.configService.get<string>('SCW_ACCESS_KEY_ID');
    const secretAccessKey = this.configService.get<string>('SCW_SECRET_ACCESS_KEY');
    if(bucketName === undefined || region === undefined || endpoint === undefined || accessKeyId === undefined || secretAccessKey === undefined) {
      throw new Error('Missing required environment variables');
    }
    this.bucketName = bucketName;
    this.region = region;
    this.endpoint = endpoint;
    this.s3Client = new S3Client({
      region: this.region,
      endpoint: this.endpoint,
      credentials: {
        accessKeyId: accessKeyId,
        secretAccessKey: secretAccessKey,
      },
      forcePathStyle: true,
    });
  }

  async uploadFile(file: Express.Multer.File, customFilename?: string): Promise<{ url: string }> {

    const filename = customFilename || `${Date.now()}_${file.originalname}`;
    const uploadParams = {
      Bucket: this.bucketName,
      Key: filename,
      Body: file.buffer,
      ACL: ObjectCannedACL.public_read,
      ContentType: file.mimetype,
    };

    await this.s3Client.send(new PutObjectCommand(uploadParams));
    const url = `${this.endpoint}/${this.bucketName}/${filename}`;

    return {
      url: url,
    };
  }
}
