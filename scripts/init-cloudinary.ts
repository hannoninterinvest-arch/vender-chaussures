import { loadEnvConfig } from "@next/env";
import { v2 as cloudinary } from "cloudinary";
loadEnvConfig(process.cwd());
async function init() {
  for (const key of [
    "CLOUDINARY_CLOUD_NAME",
    "CLOUDINARY_API_KEY",
    "CLOUDINARY_API_SECRET",
  ]) {
    if (!process.env[key]) throw new Error(`${key} est obligatoire`);
  }
  cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
    secure: true,
  });
  for (const model of [false, true]) {
    const name =
      process.env[
        model
          ? "CLOUDINARY_MODEL_UPLOAD_PRESET"
          : "CLOUDINARY_IMAGE_UPLOAD_PRESET"
      ] || (model ? "kicks_models_signed" : "kicks_images_signed");
    const options = {
      unsigned: false,
      folder: model ? "kicks/models" : "kicks/products",
      max_file_size: (model ? 20 : 6) * 1024 * 1024,
      allowed_formats: model ? ["glb"] : ["jpg", "jpeg", "png", "webp", "gif"],
      overwrite: false,
    };
    try {
      await cloudinary.api.upload_preset(name);
      await cloudinary.api.update_upload_preset(name, options);
    } catch (error) {
      if (
        (error as { error?: { http_code?: number }; http_code?: number }).error
          ?.http_code !== 404 &&
        (error as { http_code?: number }).http_code !== 404
      )
        throw error;
      await cloudinary.api.create_upload_preset({ name, ...options });
    }
    console.log(`Preset signé prêt : ${name}`);
  }
}
init().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
