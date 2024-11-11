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
exports.addRandomDataToAllFilms = exports.addRandomDataToFilm = exports.generateRandomViews = exports.generateRandomRates = exports.generateRandomComments = void 0;
exports.generateNotify = generateNotify;
const faker_1 = require("@faker-js/faker");
const ComicModel_1 = __importDefault(require("../database/model/ComicModel"));
const generateRandomComments = () => {
    const numComments = faker_1.faker.number.int({ min: 5, max: 15 });
    const comments = [];
    for (let i = 0; i < numComments; i++) {
        const comment = {
            content: faker_1.faker.lorem.sentence(),
            name: faker_1.faker.finance.accountName(),
            replies: [],
        };
        const numReplies = faker_1.faker.number.int({ min: 0, max: 5 });
        for (let j = 0; j < numReplies; j++) {
            const reply = {
                rep_content: faker_1.faker.lorem.sentence(),
                rep_name: faker_1.faker.finance.accountName(),
            };
            comment.replies.push(reply);
        }
        comments.push(comment);
    }
    return comments;
};
exports.generateRandomComments = generateRandomComments;
function generateNotify() {
    return faker_1.faker.lorem.sentence();
}
const generateRandomRates = () => {
    const numRates = faker_1.faker.number.int({ min: 1, max: 10 });
    const rates = [];
    for (let i = 0; i < numRates; i++) {
        const rate = {
            star_number: faker_1.faker.number.int({ min: 1, max: 10 }),
        };
        rates.push(rate);
    }
    return rates;
};
exports.generateRandomRates = generateRandomRates;
const generateRandomViews = () => {
    return faker_1.faker.number.int({ min: 10000, max: 100000 });
};
exports.generateRandomViews = generateRandomViews;
const addRandomDataToFilm = (filmId) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const comic = yield ComicModel_1.default.findById(filmId);
        if (!comic) {
            console.log("Film not found");
            return;
        }
        // film.comments = generateRandomComments() as any;
        comic.rate = (0, exports.generateRandomRates)();
        // comic.views = generateRandomViews() as any;
        comic.notify = generateNotify();
        yield comic.save();
        console.log(`Random data added to film ${filmId} successfully`);
    }
    catch (error) {
        console.error("Error adding random data:", error);
    }
});
exports.addRandomDataToFilm = addRandomDataToFilm;
// Thêm dữ liệu ngẫu nhiên cho tất cả các phim trong database
const addRandomDataToAllFilms = () => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const films = yield ComicModel_1.default.find();
        for (const film of films) {
            yield (0, exports.addRandomDataToFilm)(film._id);
        }
        console.log("Random data added to all films successfully");
    }
    catch (error) {
        console.error("Error adding random data to all films:", error);
    }
});
exports.addRandomDataToAllFilms = addRandomDataToAllFilms;
