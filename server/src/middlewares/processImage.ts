
import axios from "axios";
import sharp from "sharp";

import { existsSync, mkdirSync, writeFileSync } from "fs";
import { PATH_STATIC_IMAGE } from "../config/env";
import { convertToSlug, generateString } from "../utilities";

export async function downloadAndProcessImage(
  imageUrl: string,
  folder?: string,
  videoCode?: string,
  quality = 100
) {
  // Đường dẫn đến thư mục 'public/thumbnail' hoặc folder

  const assetsDirectory = `${PATH_STATIC_IMAGE}/${folder ?? "thumbnail"}`;
  const hashText = videoCode ? convertToSlug(videoCode) : generateString(12);

  // Kiểm tra xem thư mục tồn tại hay không, nếu không, tạo mới
  if (!existsSync(assetsDirectory)) {
    mkdirSync(assetsDirectory, { recursive: true });
  }
  try {
    const response = await axios.get(imageUrl, {
      responseType: "arraybuffer",
      timeout: 10000,
    });
    const imageBuffer = Buffer.from(response.data);

    const processedImageBuffer = await sharp(imageBuffer)
      .webp({ quality: quality })
      .toBuffer();

    // Lấy tên tập tin từ URL
    const fileName = hashText;
    const imagePath = `${assetsDirectory}/${fileName}.webp`;

    writeFileSync(imagePath, processedImageBuffer);
    console.log(
      "path ảnh >> ",
      imagePath,
      "Được lưu lại trong db = ",
      `assets${imagePath.split("assets")[1]}`.replace(/\\/g, "/")
    );

    return `assets${imagePath.split("assets")[1]}`.replace(/\\/g, "/"); // Trả về đường dẫn của ảnh đã xử lý
  } catch (error: any) {
    console.error("Error downloading and processing image:", error.message);
    return imageUrl;
    throw error;
  }
}
