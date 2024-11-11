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
const env_1 = require("./config/env");
const server_1 = __importDefault(require("./config/server"));
const crawl_1 = require("./crawler/crawl");
const db_1 = __importDefault(require("./database/db"));
// function cronJob() {
//     // Lập lịch chạy hàm checkAndCrawlFromOPhim mỗi 30 phút
//     schedule("*/30 * * * *", async () => {
//       console.log("Chạy hàm crawlAvdb_v3 mỗi 30 phút");
//       await crawlAvdb_v3(1, 3);
//     });
//     schedule("*/30 * * * *", async () => {
//       console.log("Chạy hàm crawlXXVN mỗi 30 phút");
//       await crawlXXVN(1, 3);
//     });
//   }
function startServer() {
    return __awaiter(this, void 0, void 0, function* () {
        yield (0, db_1.default)();
        yield new Promise((resolve) => {
            server_1.default.listen(env_1.PORT, () => {
                console.log(`Server was running on port ${env_1.PORT}`);
                resolve(true);
            });
        });
        // getAllCategory()
        (0, crawl_1.getDataForType)("hoan-thanh", 1, 2, true);
        // getDataForType("truyen-moi", 1, 2, true);
        // getDataForType("sap-ra-mat", 1, 2, true);
        (0, crawl_1.getDataForType)("dang-phat-hanh", 1, 2, true);
        // cronJob()
    });
}
(function () {
    return __awaiter(this, void 0, void 0, function* () {
        yield startServer();
    });
})();
