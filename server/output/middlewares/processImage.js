"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.downloadAndProcessImage = downloadAndProcessImage;
const axios_1 = __importDefault(require("axios"));
const sharp_1 = __importDefault(require("sharp"));
const fs_1 = require("fs");
const env_1 = require("../config/env");
const utilities_1 = require("../utilities");
function downloadAndProcessImage(imageUrl_1, folder_1, videoCode_1) {
    return __awaiter(this, arguments, void 0, function* (imageUrl, folder, videoCode, quality = 100) {
        // Đường dẫn đến thư mục 'public/thumbnail' hoặc folder
        const assetsDirectory = `${env_1.PATH_STATIC_IMAGE}/${folder !== null && folder !== void 0 ? folder : "thumbnail"}`;
        const hashText = videoCode ? (0, utilities_1.convertToSlug)(videoCode) : (0, utilities_1.generateString)(12);
        // Kiểm tra xem thư mục tồn tại hay không, nếu không, tạo mới
        if (!(0, fs_1.existsSync)(assetsDirectory)) {
            (0, fs_1.mkdirSync)(assetsDirectory, { recursive: true });
        }
        try {
            const response = yield axios_1.default.get(imageUrl, {
                responseType: "arraybuffer",
                timeout: 10000,
            });
            const imageBuffer = Buffer.from(response.data);
            const processedImageBuffer = yield (0, sharp_1.default)(imageBuffer)
                .webp({ quality: quality })
                .toBuffer();
            // Lấy tên tập tin từ URL
            const fileName = hashText;
            const imagePath = `${assetsDirectory}/${fileName}.webp`;
            (0, fs_1.writeFileSync)(imagePath, processedImageBuffer);
            console.log("path ảnh >> ", imagePath, "Được lưu lại trong db = ", `assets${imagePath.split("assets")[1]}`.replace(/\\/g, "/"));
            return `assets${imagePath.split("assets")[1]}`.replace(/\\/g, "/"); // Trả về đường dẫn của ảnh đã xử lý
        }
        catch (error) {
            console.error("Error downloading and processing image:", error.message);
            return imageUrl;
            throw error;
        }
    });
}
