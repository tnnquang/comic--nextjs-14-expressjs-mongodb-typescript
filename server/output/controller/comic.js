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
var __rest = (this && this.__rest) || function (s, e) {
    var t = {};
    for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0)
        t[p] = s[p];
    if (s != null && typeof Object.getOwnPropertySymbols === "function")
        for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) {
            if (e.indexOf(p[i]) < 0 && Object.prototype.propertyIsEnumerable.call(s, p[i]))
                t[p[i]] = s[p[i]];
        }
    return t;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getAllCategory = getAllCategory;
exports.getAllCategoryClient = getAllCategoryClient;
exports.findOneCategory = findOneCategory;
exports.checkAndAddCategories = checkAndAddCategories;
exports.getComicBySlug = getComicBySlug;
exports.getComicByFilter = getComicByFilter;
exports.getComicsFromListCategory = getComicsFromListCategory;
exports.top10ComicsDaily = top10ComicsDaily;
exports.top10ComicsWeekly = top10ComicsWeekly;
exports.top10ComicsMonthly = top10ComicsMonthly;
exports.updateChapterView = updateChapterView;
exports.getTop24NewPost = getTop24NewPost;
exports.getTotalPageFromLimit = getTotalPageFromLimit;
exports.getAllSlug = getAllSlug;
const lodash_1 = require("lodash");
const axiosIntance_1 = __importDefault(require("../config/axiosIntance"));
const CategoryModel_1 = __importDefault(require("../database/model/CategoryModel"));
const utilities_1 = require("../utilities");
const ComicModel_1 = __importDefault(require("../database/model/ComicModel"));
const enum_1 = require("../types/enum");
function getAllCategory() {
    return __awaiter(this, void 0, void 0, function* () {
        var _a;
        try {
            const response = yield axiosIntance_1.default
                .get("/the-loai")
                .then((value) => value.data);
            if (!(0, lodash_1.isEmpty)((_a = response === null || response === void 0 ? void 0 : response.data) === null || _a === void 0 ? void 0 : _a.items)) {
                const newData = response.data.items.map((item) => ({
                    name: item.name,
                    slug: item.slug,
                }));
                yield CategoryModel_1.default.insertMany(newData);
                console.log("Insert list category success full");
            }
            else {
                console.log("List category is empty");
            }
        }
        catch (error) {
            console.log("Get list category was fail: ", error);
        }
    });
}
function getAllCategoryClient(req, res) {
    return __awaiter(this, void 0, void 0, function* () {
        const list = yield CategoryModel_1.default.find({ isDeleted: false }).sort({ name: 1 });
        if (!list)
            return res.json({
                list: [],
            });
        const dataFormatted = list.map((e) => ({
            name: e.name,
            slug: e.slug,
            isDeleted: e.isDeleted,
        }));
        return res.json({
            list: dataFormatted,
        });
    });
}
function findOneCategory(req, res) {
    return __awaiter(this, void 0, void 0, function* () {
        var _a;
        try {
            const slug = req.query.slug;
            // console.log("eeeeee", req.query, req.params);
            const data = yield CategoryModel_1.default.findOne({
                $or: [{ name: slug }, { slug: slug }],
            });
            if (data) {
                const tmp = {
                    name: data.name,
                    slug: data.slug,
                    isDeleted: data.isDeleted,
                };
                return res.status(200).json({
                    result: tmp,
                    message: "Get data success",
                });
            }
            return res.json({
                result: null,
            });
        }
        catch (error) {
            return res.status(500).json({
                message: `Internal Server Error: ${(_a = error === null || error === void 0 ? void 0 : error.message) !== null && _a !== void 0 ? _a : error}`,
                result: null,
                status: 500,
            });
        }
    });
}
function checkAndAddCategories(categories) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            for (const category of categories) {
                const tmp = category.trim();
                const existingCategory = yield CategoryModel_1.default.findOne({
                    name: { $regex: new RegExp(tmp), $options: "i" },
                });
                // Nếu chưa tồn tại, thêm mới vào database
                if (!existingCategory) {
                    const newData = new CategoryModel_1.default({
                        name: (0, utilities_1.toCapitalize)(tmp),
                        slug: (0, utilities_1.convertToSlug)(tmp),
                    });
                    yield newData.save();
                    console.log(`Thêm mới category: ${category}`);
                }
                else {
                    console.log(`Category đã tồn tại: ${category}`);
                }
            }
            console.log("Hoàn thành kiểm tra và thêm mới");
        }
        catch (error) {
            console.error("Lỗi kiểm tra và thêm mới category:", error);
        }
    });
}
function getComicBySlug(req, res) {
    return __awaiter(this, void 0, void 0, function* () {
        var _a, _b;
        try {
            const _slug = req.body.slug;
            const chapterSlug = req.body.chapterSlug;
            const typeShow = req.body.type;
            const isSEOWithChapter = req.body.isSEOWithChapter;
            const ress = yield ComicModel_1.default.findOne({
                slug: _slug,
                isDeleted: false,
            }).lean();
            if (!ress) {
                return res.status(404).json({
                    item: null,
                    error: "The comic doesn't exist",
                    code: 404,
                });
            }
            if (typeShow === "short") {
                const listChapters = (_a = ress.listChapters[0].chapters) === null || _a === void 0 ? void 0 : _a.map((el) => {
                    const { views, chapterName, chapterTitle, slug } = el;
                    return { views, chapterName, chapterTitle, slug };
                });
                const dataResponse = {
                    title: ress.title.trim(),
                    titleSEO: ress.titleSEO,
                    descriptionSEO: ress.descriptionSEO,
                    content: ress.content,
                    originTitle: ress.originTitle,
                    author: ress.author,
                    categories: ress.categories,
                    status: ress.status,
                    currentChapter: ress.currentChapter,
                    // list_episode: ress.list_episode,
                    language: "Tiếng Việt",
                    quality: "Ảnh chất lượng cao",
                    rate: ress.rate,
                    slug: ress.slug,
                    thumbnail: ress.thumbnail,
                    keywords: ress.keywords,
                    listChapters,
                };
                return res.json({ item: dataResponse });
            }
            else {
                const list = ress.listChapters;
                const chapter = list.map((value) => {
                    const serverName = value.serverName;
                    let currentChapterIndex = value.chapters.findIndex((e) => e.slug === chapterSlug);
                    if (currentChapterIndex === -1) {
                        currentChapterIndex = 0;
                    }
                    const currentChapter = value.chapters[currentChapterIndex];
                    const nextChapter = value.chapters[currentChapterIndex + 1];
                    const previousChapter = currentChapterIndex > 0
                        ? value.chapters[currentChapterIndex - 1]
                        : null;
                    return {
                        serverName,
                        chapterData: currentChapter,
                        nextChapter: nextChapter ? nextChapter.slug : null,
                        previousChapter: previousChapter ? previousChapter.slug : null,
                    };
                });
                const chaps = ress.listChapters[0].chapters.map((value) => ({
                    chapterName: `${value.chapterName}${!(0, lodash_1.isEmpty)(value.chapterTitle) ? `: ${value.chapterTitle}` : ""}`,
                    slug: value.slug,
                    totalImages: value.chapterImages.length,
                }));
                const { listChapters, _id, createdAt, updatedAt, rate, isDeleted, orginSlug } = ress, rest = __rest(ress, ["listChapters", "_id", "createdAt", "updatedAt", "rate", "isDeleted", "orginSlug"]);
                if (isSEOWithChapter) {
                    const chap = `${chapter[0].chapterData.chapterName}${chapter[0].chapterData.chapterTitle
                        ? `: ${chapter[0].chapterData.chapterTitle}`
                        : ""}`;
                    return res.json({
                        item: Object.assign(Object.assign({}, rest), { chap }),
                    });
                }
                return res.json({ item: Object.assign(Object.assign({}, rest), { chapter, listChapters: chaps }) });
            }
        }
        catch (error) {
            return res.json({
                item: null,
                error: `Internal Server Error: ${(_b = error === null || error === void 0 ? void 0 : error.message) !== null && _b !== void 0 ? _b : error}`,
                code: 500,
            });
        }
    });
}
/* Film filter with aggregation pipeline */
function getComicByFilter(req, res) {
    return __awaiter(this, void 0, void 0, function* () {
        var _a, _b;
        try {
            const limit = Number.isNaN(+req.body.limit) ? 20 : +req.body.limit;
            const { filters } = req.body;
            const { type, category, keyword, status, author, page } = filters;
            let current_page = 1;
            if (req.body.page) {
                current_page = Number.isNaN(+req.body.page) ? 1 : +req.body.page;
            }
            else if (page) {
                current_page = Number.isNaN(+page) ? 1 : +page;
            }
            const filtersFormatted = {};
            if (!(0, lodash_1.isEmpty)(category)) {
                if (Array.isArray(category)) {
                    const categories = yield Promise.all(category.map((cate) => __awaiter(this, void 0, void 0, function* () {
                        const data = yield CategoryModel_1.default.findOne({
                            $or: [
                                { name: { $regex: new RegExp(cate.trim(), "i") } },
                                { slug: cate },
                            ],
                        });
                        return data ? data.name.trim() : null;
                    })));
                    filtersFormatted["categories"] = { $in: categories.filter(Boolean) };
                }
                else {
                    const data = yield CategoryModel_1.default.findOne({
                        $or: [
                            { name: { $regex: new RegExp(category, "i") } },
                            { slug: category },
                        ],
                    });
                    if (data) {
                        filtersFormatted["categories"] = { $in: [data.name.trim()] };
                    }
                }
            }
            if (!(0, lodash_1.isEmpty)(author)) {
                filtersFormatted["author"] = {
                    $in: Array.isArray(author)
                        ? author.map((e) => e.trim())
                        : [author.trim()],
                };
            }
            if (!(0, lodash_1.isEmpty)(status)) {
                if (Object.values(enum_1.EnumComicText).includes(status)) {
                    filtersFormatted["status"] = status;
                }
            }
            // if (!isEmpty(author)) {
            //   filtersFormatted["author"] = {
            //     $in: Array.isArray(author)
            //       ? author.map((e: string) => e.trim())
            //       : [author.trim()],
            //   };
            // }
            const skip = (current_page - 1) * limit;
            const matchStage = Object.assign(Object.assign({}, filtersFormatted), { isDeleted: false });
            console.log("filter matchStage >> ", matchStage, keyword);
            if (keyword) {
                const kw = (0, utilities_1.escapeRegex)(keyword.trim()); // Xóa khoảng trắng và escape các ký tự đặc biệt
                matchStage.$or = [{ keywords: { $regex: new RegExp(kw, "i") } }];
            }
            const aggregationPipeline = [
                { $match: matchStage },
                {
                    $facet: {
                        totalItems: [{ $count: "count" }],
                        data: [
                            { $skip: skip },
                            { $limit: limit },
                            { $sort: { updatedAt: -1 } },
                            {
                                $project: {
                                    title: 1,
                                    titleSEO: 1,
                                    descriptionSEO: 1,
                                    content: 1,
                                    originTitle: 1,
                                    thumbnail: 1,
                                    slug: 1,
                                    currentChapter: 1,
                                    rate: 1,
                                    categories: 1,
                                },
                            },
                        ],
                    },
                },
            ];
            const result = yield ComicModel_1.default.aggregate(aggregationPipeline);
            const totalItems = ((_a = result[0].totalItems[0]) === null || _a === void 0 ? void 0 : _a.count) || 0;
            const totalPages = Math.ceil(totalItems / limit);
            const data = result[0].data;
            res.json({
                result: data,
                totalItems,
                totalPages,
                currentPage: current_page,
            });
        }
        catch (error) {
            res.status(500).json({
                message: `Internal Server Error: ${(_b = error === null || error === void 0 ? void 0 : error.message) !== null && _b !== void 0 ? _b : error}`,
                result: [],
            });
        }
    });
}
function getComicsFromListCategory(req, res) {
    return __awaiter(this, void 0, void 0, function* () {
        var _a;
        try {
            const listCategory = req.body.category;
            const _title = req.body.title;
            console.log("getComicsFromListCategory >> ", listCategory, _title);
            // console.log("hehehee", _title, listCategory)
            if ((0, lodash_1.isEmpty)(listCategory))
                return res.status(404).json({
                    result: [],
                    error: "There are no comic in the genre you requested",
                    code: 404,
                });
            const promises = listCategory.map((e) => ComicModel_1.default.find({
                categories: { $in: [e] },
                isDeleted: false,
                title: { $ne: _title },
            })
                .limit(12)
                .sort({ updatedAt: -1 })
                .lean());
            const ress = yield Promise.all(promises);
            const formatData = listCategory.map((e, i) => ({
                name: e,
                result: ress[i].map((value) => {
                    const { title, titleSEO, slug, thumbnail, currentChapter, content, descriptionSEO, } = value;
                    return {
                        title,
                        titleSEO,
                        slug,
                        thumbnail,
                        currentChapter,
                        content,
                        descriptionSEO,
                    };
                }),
            }));
            return res.status(200).json({ result: formatData });
        }
        catch (error) {
            return res.json({
                result: null,
                error: `Internal Server Error: ${(_a = error === null || error === void 0 ? void 0 : error.message) !== null && _a !== void 0 ? _a : error}`,
                code: 500,
            });
        }
    });
}
function top10ComicsDaily(req, res) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const data = yield ComicModel_1.default.aggregate([
                // Unwind listChapters and chapters arrays
                { $unwind: "$listChapters" },
                { $unwind: "$listChapters.chapters" },
                // Match documents where createdAt is within the last 24 hours
                {
                    $match: {
                        "listChapters.chapters.createdAt": {
                            $gte: new Date(new Date().setHours(0, 0, 0, 0)), // Start of the day
                            $lt: new Date(new Date().setHours(23, 59, 59, 999)), // End of the day
                        },
                    },
                },
                // Group by comic id and sum the views
                {
                    $group: {
                        _id: "$_id",
                        title: { $first: "$title" },
                        slug: { $first: "$slug" },
                        categories: { $first: "$categories" },
                        currentChapter: { $first: "$currentChapter" },
                        totalViews: { $sum: "$listChapters.chapters.views" },
                    },
                },
                // Sort by total views in descending order
                { $sort: { totalViews: -1 } },
                // Limit to top 10
                { $limit: 10 },
            ]);
            if (data.length == 0 || !data) {
                return res.json({ message: "Data daily is empty", result: null });
            }
            return res.json({ message: "Get data daily success", result: data });
        }
        catch (error) {
            return res.json({ message: "Get data daily error", result: null, error });
        }
    });
}
function top10ComicsWeekly(req, res) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const startOfWeek = (0, utilities_1.getStartOfWeek)();
            const endOfWeek = (0, utilities_1.getEndOfWeek)();
            const top10ComicsMonthly = yield ComicModel_1.default.aggregate([
                // Unwind listChapters and chapters arrays
                { $unwind: "$listChapters" },
                { $unwind: "$listChapters.chapters" },
                // Match documents where createdAt is within the current month
                {
                    $match: {
                        "listChapters.chapters.createdAt": {
                            $gte: startOfWeek,
                            $lt: endOfWeek,
                        },
                    },
                },
                // Group by comic id and sum the views
                {
                    $group: {
                        _id: "$_id",
                        title: { $first: "$title" },
                        slug: { $first: "$slug" },
                        categories: { $first: "$categories" },
                        currentChapter: { $first: "$currentChapter" },
                        totalViews: { $sum: "$listChapters.chapters.views" },
                    },
                },
                // Sort by total views in descending order
                { $sort: { totalViews: -1 } },
                // Limit to top 10
                { $limit: 10 },
            ]);
            if (top10ComicsMonthly.length == 0 || !top10ComicsMonthly) {
                return res.json({ message: "Data monthly is empty", result: null });
            }
            return res.json({
                message: "Get data monthly success",
                result: top10ComicsMonthly,
            });
        }
        catch (error) {
            return res.json({ message: "Get data monthly error", result: null, error });
        }
    });
}
function top10ComicsMonthly(req, res) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const top10ComicsMonthly = yield ComicModel_1.default.aggregate([
                // Unwind listChapters and chapters arrays
                { $unwind: "$listChapters" },
                { $unwind: "$listChapters.chapters" },
                // Match documents where createdAt is within the current month
                {
                    $match: {
                        "listChapters.chapters.createdAt": {
                            $gte: new Date(new Date().getFullYear(), new Date().getMonth(), 1), // Start of the month
                            $lt: new Date(new Date().getFullYear(), new Date().getMonth() + 1, 1), // Start of next month
                        },
                    },
                },
                // Group by comic id and sum the views
                {
                    $group: {
                        _id: "$_id",
                        title: { $first: "$title" },
                        slug: { $first: "$slug" },
                        categories: { $first: "$categories" },
                        currentChapter: { $first: "$currentChapter" },
                        totalViews: { $sum: "$listChapters.chapters.views" },
                    },
                },
                // Sort by total views in descending order
                { $sort: { totalViews: -1 } },
                // Limit to top 10
                { $limit: 10 },
            ]);
            if (top10ComicsMonthly.length == 0 || !top10ComicsMonthly) {
                return res.json({ message: "Data monthly is empty", result: null });
            }
            return res.json({
                message: "Get data monthly success",
                result: top10ComicsMonthly,
            });
        }
        catch (error) {
            return res.json({ message: "Get data monthly error", result: null, error });
        }
    });
}
function updateChapterView(req, res) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            // Tìm truyện và chương theo slug của truyện và chương
            const { comicSlug, chapterSlug } = req.body;
            if (!comicSlug || !chapterSlug) {
                return res.json({
                    message: "Not found comic and chapter",
                    result: false,
                });
            }
            const result = yield ComicModel_1.default.findOneAndUpdate({
                slug: comicSlug, // Tìm truyện theo slug
                "listChapters.chapters.slug": chapterSlug, // Tìm chương theo slug
            }, {
                $inc: { "listChapters.$[].chapters.$[chapter].views": 1 }, // Tăng lượt xem lên 1
            }, {
                arrayFilters: [{ "chapter.slug": chapterSlug }], // Lọc đúng chương cần cập nhật
                new: true, // Trả về tài liệu đã cập nhật
            });
            if (!result) {
                return res.json({
                    message: "Not found comic and chapter",
                    result: false,
                });
                console.log("Truyện hoặc chương không tồn tại");
                return null;
            }
            return res.json({ message: "Update view succesful", result: true });
            console.log("Cập nhật lượt xem thành công", result);
            return result;
        }
        catch (error) {
            return res.json({ message: "Not found comic and chapter", result: false });
            console.error("Lỗi khi cập nhật lượt xem:", error);
        }
    });
}
function getTop24NewPost(req, res) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const { limit } = req.body;
            const LIMIT_DEFAULT = +limit || 24;
            const result = yield ComicModel_1.default.find({ isDeleted: false })
                .limit(LIMIT_DEFAULT)
                .sort({ createdAt: -1 })
                .lean();
            const data = result.map((e) => {
                const { title, originTitle, thumbnail, slug, status, currentChapter, author, } = e;
                return {
                    title,
                    originTitle,
                    thumbnail,
                    slug,
                    status,
                    currentChapter,
                    author,
                };
            });
            return res.json({
                result: data,
                message: "Get data success",
            });
        }
        catch (error) {
            return res.json({
                result: [],
                message: "Internal Error Server: " + error.message,
            });
        }
    });
}
function getTotalPageFromLimit(req, res) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const { limit } = req.query;
            const len = yield ComicModel_1.default.countDocuments();
            const totalPages = Math.ceil(len / limit);
            return res.json({ result: totalPages });
        }
        catch (error) {
            res.json({ result: 0, message: error });
        }
    });
}
function getAllSlug(req, res) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const { start, end } = req.query;
            const lstSlug = yield ComicModel_1.default.find({}, "slug title updatedAt")
                .skip(start)
                .limit(parseInt(end) - parseInt(start))
                .lean();
            return res.json({
                result: lstSlug,
                message: "Fetch all slug successfully",
            });
        }
        catch (error) {
            return res.json({
                result: [],
                message: "Fetch all slug was failed. See error below",
                error: error,
            });
        }
    });
}
