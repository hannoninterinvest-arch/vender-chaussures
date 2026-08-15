import {
  Injectable,
  PayloadTooLargeException,
  ServiceUnavailableException,
  UnsupportedMediaTypeException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { v2 as cloudinary, UploadApiResponse } from 'cloudinary';

const ALLOWED = new Set(['image/jpeg', 'image/png', 'image/webp', 'image/gif']);
const MAX_BYTES = 6 * 1024 * 1024;

@Injectable()
export class CloudinaryService {
  constructor(private readonly config: ConfigService) {
    cloudinary.config({
      cloud_name: this.config.get<string>('CLOUDINARY_CLOUD_NAME'),
      api_key: this.config.get<string>('CLOUDINARY_API_KEY'),
      api_secret: this.config.get<string>('CLOUDINARY_API_SECRET'),
      secure: true,
    });
  }

  configured() {
    return Boolean(
      this.config.get<string>('CLOUDINARY_CLOUD_NAME') &&
        this.config.get<string>('CLOUDINARY_API_KEY') &&
        this.config.get<string>('CLOUDINARY_API_SECRET'),
    );
  }

  async uploadImage(file: Express.Multer.File) {
    if (!this.configured()) {
      throw new ServiceUnavailableException(
        'Cloudinary n’est pas configuré. Ajoute CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY et CLOUDINARY_API_SECRET dans backend/.env',
      );
    }
    if (!file?.buffer?.length) {
      throw new UnsupportedMediaTypeException('Fichier image manquant');
    }
    if (file.size > MAX_BYTES) {
      throw new PayloadTooLargeException('Image trop lourde (max 6 Mo)');
    }
    if (!ALLOWED.has(file.mimetype)) {
      throw new UnsupportedMediaTypeException('Formats acceptés : JPG, PNG, WebP, GIF');
    }

    const result = await new Promise<UploadApiResponse>((resolve, reject) => {
      const stream = cloudinary.uploader.upload_stream(
        {
          folder: 'kicks/products',
          resource_type: 'image',
          overwrite: false,
        },
        (err, uploaded) => {
          if (err || !uploaded) reject(err ?? new Error('Upload Cloudinary échoué'));
          else resolve(uploaded);
        },
      );
      stream.end(file.buffer);
    });

    return {
      url: result.secure_url,
      publicId: result.public_id,
    };
  }
}
