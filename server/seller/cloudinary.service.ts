import { randomUUID } from "node:crypto";
import { v2 as cloudinary } from "cloudinary";
import { ConfigService } from "../config";
import {
  BadRequestException,
  PayloadTooLargeException,
  ServiceUnavailableException,
  UnsupportedMediaTypeException,
} from "../http";

export class CloudinaryService {
  constructor(private readonly config: ConfigService) {}

  signUpload(input: {
    kind?: unknown;
    size?: unknown;
    name?: unknown;
    mime?: unknown;
  }) {
    const cloudName = this.config.get<string>("CLOUDINARY_CLOUD_NAME");
    const apiKey = this.config.get<string>("CLOUDINARY_API_KEY");
    const secret = this.config.get<string>("CLOUDINARY_API_SECRET");
    if (!cloudName || !apiKey || !secret)
      throw new ServiceUnavailableException("Cloudinary n’est pas configuré");
    if (!input || !["image", "model"].includes(String(input.kind)))
      throw new BadRequestException("Type de fichier invalide");
    const model = input.kind === "model";
    if (
      typeof input.size !== "number" ||
      !Number.isSafeInteger(input.size) ||
      input.size <= 0
    )
      throw new BadRequestException("Taille invalide");
    if (input.size > (model ? 20 : 6) * 1024 * 1024)
      throw new PayloadTooLargeException(
        model
          ? "Modèle trop lourd (max 20 Mo)"
          : "Image trop lourde (max 6 Mo)",
      );
    if (
      model
        ? !(
            typeof input.name === "string" &&
            input.name.toLowerCase().endsWith(".glb")
          )
        : !["image/jpeg", "image/png", "image/webp", "image/gif"].includes(
            String(input.mime),
          )
    ) {
      throw new UnsupportedMediaTypeException(
        model
          ? "Le fichier 3D doit être un .glb"
          : "Formats acceptés : JPG, PNG, WebP, GIF",
      );
    }
    // Signed presets also enforce format and size at Cloudinary, independently of the browser.
    const preset =
      this.config.get<string>(
        model
          ? "CLOUDINARY_MODEL_UPLOAD_PRESET"
          : "CLOUDINARY_IMAGE_UPLOAD_PRESET",
      ) || (model ? "kicks_models_signed" : "kicks_images_signed");
    const params = {
      timestamp: Math.floor(Date.now() / 1000),
      upload_preset: preset,
      public_id: `${randomUUID()}${model ? ".glb" : ""}`,
    };
    return {
      cloudName,
      apiKey,
      resourceType: model ? "raw" : "image",
      params,
      signature: cloudinary.utils.api_sign_request(params, secret),
    };
  }
}
