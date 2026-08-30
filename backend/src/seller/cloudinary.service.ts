import {
  Injectable,
  PayloadTooLargeException,
  ServiceUnavailableException,
  UnsupportedMediaTypeException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { v2 as cloudinary, UploadApiResponse } from 'cloudinary';

const IMAGE_TYPES = new Set(['image/jpeg', 'image/png', 'image/webp', 'image/gif']);
const VIDEO_TYPES = new Set([
  'video/mp4',
  'video/webm',
  'video/quicktime',
  'video/x-m4v',
  'video/ogg',
]);
const IMAGE_MAX = 6 * 1024 * 1024;
const VIDEO_MAX = 40 * 1024 * 1024;

export type UploadedMedia = {
  url: string;
  publicId: string;
  resourceType: 'image' | 'video';
};

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
    return this.upload(file, 'image');
  }

  async uploadVideo(file: Express.Multer.File) {
    return this.upload(file, 'video');
  }

  async uploadMedia(file: Express.Multer.File): Promise<UploadedMedia> {
    const kind = this.detectKind(file);
    return this.upload(file, kind);
  }

  private detectKind(file: Express.Multer.File): 'image' | 'video' {
    if (VIDEO_TYPES.has(file?.mimetype) || file?.mimetype?.startsWith('video/')) return 'video';
    if (IMAGE_TYPES.has(file?.mimetype) || file?.mimetype?.startsWith('image/')) return 'image';
    throw new UnsupportedMediaTypeException(
      'Formats acceptés : JPG, PNG, WebP, GIF, MP4, WebM, MOV',
    );
  }

  private async upload(file: Express.Multer.File, kind: 'image' | 'video'): Promise<UploadedMedia> {
    if (!this.configured()) {
      throw new ServiceUnavailableException(
        'Cloudinary n’est pas configuré. Ajoute CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY et CLOUDINARY_API_SECRET dans backend/.env',
      );
    }
    if (!file?.buffer?.length) {
      throw new UnsupportedMediaTypeException(
        kind === 'video' ? 'Fichier vidéo manquant' : 'Fichier image manquant',
      );
    }
    const max = kind === 'video' ? VIDEO_MAX : IMAGE_MAX;
    if (file.size > max) {
      throw new PayloadTooLargeException(
        kind === 'video' ? 'Vidéo trop lourde (max 40 Mo)' : 'Image trop lourde (max 6 Mo)',
      );
    }
    if (kind === 'image' && !IMAGE_TYPES.has(file.mimetype) && !file.mimetype.startsWith('image/')) {
      throw new UnsupportedMediaTypeException('Formats acceptés : JPG, PNG, WebP, GIF');
    }
    if (kind === 'video' && !VIDEO_TYPES.has(file.mimetype) && !file.mimetype.startsWith('video/')) {
      throw new UnsupportedMediaTypeException('Formats vidéo : MP4, WebM, MOV');
    }

    const result = await new Promise<UploadApiResponse>((resolve, reject) => {
      const stream = cloudinary.uploader.upload_stream(
        {
          folder: kind === 'video' ? 'kicks/videos' : 'kicks/products',
          resource_type: kind,
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
      resourceType: kind,
    };
  }
}
