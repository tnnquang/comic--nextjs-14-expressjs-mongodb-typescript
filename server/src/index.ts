import instance from "./config/axiosIntance";
import { PORT } from "./config/env";
import server from "./config/server";
import { getAllCategory } from "./controller/comic";
import { getDataComic, getDataForType } from "./crawler/crawl";
import connectDatabase from "./database/db";
import ComicModel from "./database/model/ComicModel";
import { generateRandomRates } from "./utilities/fake";

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

async function startServer() {
  await connectDatabase();

  await new Promise((resolve) => {
    server.listen(PORT, () => {
      console.log(`Server was running on port ${PORT}`);
      resolve(true);
    });
  });

  // getAllCategory()

  getDataForType("hoan-thanh", 1, 30, true);
  getDataForType("truyen-moi", 1, 2, true);
  getDataForType("sap-ra-mat", 1, 2, true);
  getDataForType("dang-phat-hanh", 1, 30, true);

  // cronJob()
}

(async function () {
  await startServer();
})();
