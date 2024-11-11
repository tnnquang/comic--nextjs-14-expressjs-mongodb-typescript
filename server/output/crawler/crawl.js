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
exports.generateStatus = generateStatus;
exports.getChapterApiData = getChapterApiData;
exports.parseListChapterServer = parseListChapterServer;
exports.getDataComic = getDataComic;
exports.getDataForType = getDataForType;
exports.crawlFromOTruyen = crawlFromOTruyen;
const lodash_1 = require("lodash");
const axiosIntance_1 = __importDefault(require("../config/axiosIntance"));
const utilities_1 = require("../utilities");
const processImage_1 = require("../middlewares/processImage");
const ComicModel_1 = __importDefault(require("../database/model/ComicModel"));
const fake_1 = require("../utilities/fake");
const maxRetry = 3;
function generateStatus(originText) {
    if (originText === "ongoing")
        return "Đang phát hành";
    if (originText === "completed") {
        return "Đã hoàn thành";
    }
    if (originText === "coming_soon") {
        return "Sắp ra mắt";
    }
    return "Đã hoàn thành";
}
function correctChapterApiDataURL(url) {
    // Định dạng đúng của URL
    const correctFormat = /^https:\/\/sv1\.otruyencdn\.com\/v1\/api\/chapter\/[a-fA-F0-9]{24}$/;
    // Kiểm tra URL có đúng định dạng không
    if (correctFormat.test(url)) {
        return url; // URL đã đúng, trả về như cũ
    }
    else {
        // Tìm phần chính xác của mã hash (24 ký tự đầu tiên)
        const baseURL = "https://sv1.otruyencdn.com/v1/api/chapter/";
        const hashPart = url.replace(baseURL, "").slice(0, 24);
        // Kết hợp lại thành URL đúng
        return baseURL + hashPart;
    }
}
function getChapterApiData(apiLink, originLink) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const link = correctChapterApiDataURL(apiLink);
            const chapterJsonData = yield fetch(link).then((value) => value.json());
            const data = chapterJsonData === null || chapterJsonData === void 0 ? void 0 : chapterJsonData.data;
            let obj = {};
            const cdnPath = "https://sv1.otruyencdn.com" + "/" + data.item.chapter_path;
            const chapterImages = data.item.chapter_image;
            obj["CDNPath"] = cdnPath;
            obj["chapterImages"] = chapterImages.map((e) => ({
                imageFile: e.image_file,
                imagePage: e.image_page,
            }));
            obj["originLink"] = link;
            return obj;
            // console.log(
            //   "Error: Can not request getChapterApiData >> ",
            //   chapterJsonData
            // );
        }
        catch (error) {
            console.log("Catch error getChapterApiData, retrying >> ", apiLink, originLink);
            return yield (0, utilities_1.retryWithExponentialBackoff)(() => getChapterApiData(apiLink, originLink), 3, 1000);
        }
    });
}
function parseListChapterServer(listChapters, link) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            console.log("parseListChapterServer: Handle list chapters server >> ", link);
            if (!Array.isArray(listChapters)) {
                throw new Error("Invalid input: listChapters must be an array.");
            }
            const dataParsed = [];
            for (const chap of listChapters) {
                const serverData = chap.server_data;
                const chapters = [];
                for (const ep of serverData) {
                    let obj = {};
                    const chapterName = !Number.isNaN(parseFloat(ep.chapter_name))
                        ? `Chapter ${ep.chapter_name}`
                        : ep.chapter_name;
                    const chapterTitle = ep.chapter_title;
                    obj["chapterTitle"] = chapterTitle;
                    obj["chapterName"] = chapterName;
                    obj["slug"] = (0, utilities_1.convertToSlug)(chapterName);
                    const chapterApiData = yield getChapterApiData(ep.chapter_api_data, link);
                    obj["views"] = (0, fake_1.generateRandomViews)();
                    if (!chapterApiData) {
                        console.log("Data of function getChapterApiData return null");
                    }
                    else {
                        chapters.push(Object.assign(Object.assign({}, obj), chapterApiData));
                    }
                }
                dataParsed.push({ serverName: chap.server_name, chapters: chapters });
            }
            return dataParsed;
        }
        catch (error) {
            // Handle the error (e.g., return a default value or rethrow)
            console.error("Error in parseListChapterServer >> ", link, " >> ", error.message);
            return yield (0, utilities_1.retryWithExponentialBackoff)(() => parseListChapterServer(listChapters, link), 3, 1000);
            return null; // Return null after 3 unsuccessful retries
            throw error;
        }
    });
}
function getDataComic(link_1) {
    return __awaiter(this, arguments, void 0, function* (link, rejectImage = false) {
        var _a, _b, _c;
        try {
            if (!link)
                return null;
            console.log("getDataComic >> ", link);
            const response = yield axiosIntance_1.default.get(link);
            const data = (_a = response.data) === null || _a === void 0 ? void 0 : _a.data;
            if (!(0, lodash_1.isEmpty)(data === null || data === void 0 ? void 0 : data.item)) {
                const titleSEO = data.seoOnPage.titleHead || "";
                const descriptionSEO = data.seoOnPage.descriptionHead || "";
                const thumbnail = rejectImage
                    ? ""
                    : yield (0, processImage_1.downloadAndProcessImage)(data.seoOnPage.seoSchema.image, "thumbnail", data.item.name);
                const title = data.item.name;
                const content = data.item.content;
                const slug = (0, utilities_1.convertToSlug)(data.item.name);
                const originTitle = data.item.origin_name;
                const categories = data.item.category.map((e) => e.name);
                const author = data.item.author;
                const currentChapter = ((_c = (_b = data.item.chapters[0]) === null || _b === void 0 ? void 0 : _b.server_data) === null || _c === void 0 ? void 0 : _c.length) || 0;
                const status = generateStatus(data.item.status);
                const listChapters = yield parseListChapterServer(data.item.chapters, link);
                return {
                    titleSEO,
                    descriptionSEO,
                    title,
                    content,
                    thumbnail,
                    slug,
                    originTitle,
                    categories,
                    author,
                    listChapters,
                    currentChapter,
                    status,
                    orginSlug: link,
                    rate: (0, fake_1.generateRandomRates)(),
                    keywords: (0, utilities_1.addKeywords)(originTitle && !(0, lodash_1.isEmpty)(originTitle[0])
                        ? [title, originTitle.join(",")]
                        : title),
                };
            }
        }
        catch (error) {
            console.error("Error (catch) in getDataComic:", error.message);
            for (let retry = 0; retry < maxRetry; retry++) {
                try {
                    console.log(`getDataComic: Retrying (attempt ${retry + 1})...`);
                    const result = yield getDataComic(link, rejectImage);
                    if (result) {
                        return result;
                    }
                }
                catch (retryError) {
                    console.error("Retry failed in function getDataComic:", retryError.message);
                }
            }
            return null; // Return null after 3 unsuccessful retries
        }
    });
}
function getDataForType(type_1, from_1, to_1) {
    return __awaiter(this, arguments, void 0, function* (type, from, to, isAll = false) {
        var _a;
        try {
            const pagination = yield axiosIntance_1.default
                .get(`/danh-sach/${type}`)
                .then((response) => response.data.data)
                .then((value) => {
                return value.params.pagination;
            });
            const totalPage = Math.ceil(pagination.totalItems / pagination.totalItemsPerPage);
            const start = from || 1;
            const end = isAll ? totalPage : to || 5;
            console.log(`----------Start crawl OTruyen with type ${type} from page ${start} to ${end}----------`);
            for (let i = 1; i <= end; i++) {
                const operations = [];
                try {
                    const response = yield axiosIntance_1.default.get(`/danh-sach/${type}?page=${i}`);
                    const data = response.data;
                    if (!(0, lodash_1.isEmpty)((_a = data === null || data === void 0 ? void 0 : data.data) === null || _a === void 0 ? void 0 : _a.items)) {
                        for (const item of data.data.items) {
                            const exist = yield ComicModel_1.default.findOne({ title: item.name.trim() });
                            const slug = item.slug;
                            if (!exist) {
                                console.log("Get data comic for insert new comic");
                                const dataComic = yield getDataComic(`/truyen-tranh/${slug}`);
                                if (dataComic) {
                                    const operator = {
                                        insertOne: {
                                            document: dataComic,
                                        },
                                    };
                                    operations.push(operator);
                                    console.log("Add to attempt array: ", item.name);
                                }
                            }
                            else {
                                console.log("Check for update data comic was existent");
                                if (exist.status === "Đã hoàn thành") {
                                    console.log("Phim đã hoàn tất, qua phim khác");
                                    return;
                                }
                                const dataComic = yield getDataComic(`/truyen-tranh/${slug}`, true);
                                if (dataComic) {
                                    let obj = {};
                                    if (dataComic.status !== exist.status) {
                                        obj["status"] = dataComic.status;
                                    }
                                    if (JSON.stringify(dataComic.author) !==
                                        JSON.stringify(exist.author)) {
                                        obj["author"] = dataComic.author;
                                    }
                                    if (JSON.stringify(dataComic.categories) !==
                                        JSON.stringify(exist.categories)) {
                                        obj["categories"] = dataComic.categories;
                                    }
                                    if (dataComic.currentChapter !== exist.currentChapter) {
                                        obj["currentChapter"] = dataComic.currentChapter;
                                    }
                                    obj["listChapters"] = dataComic === null || dataComic === void 0 ? void 0 : dataComic.listChapters;
                                    operations.push({
                                        updateOne: {
                                            filter: { title: item.name.trim() },
                                            update: { $set: obj },
                                        },
                                    });
                                    console.log("Update data of comic >>> ", item.name);
                                }
                            }
                        }
                        yield ComicModel_1.default.bulkWrite(operations);
                        console.log(`Inserted page ${i}`);
                    }
                }
                catch (error) {
                    console.log(`Error with page ${i} when get data comic: `, error);
                }
            }
        }
        catch (error) {
            console.log("getDataForType was not failed: ", error);
        }
    });
}
function crawlFromOTruyen() {
    return __awaiter(this, arguments, void 0, function* (from = 1, to, isAll = false) {
        try {
        }
        catch (error) { }
    });
}
