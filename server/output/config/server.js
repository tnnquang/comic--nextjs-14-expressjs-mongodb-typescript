"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const cors_1 = __importDefault(require("cors"));
const express_1 = __importDefault(require("express"));
const cookie_parser_1 = __importDefault(require("cookie-parser"));
const body_parser_1 = __importDefault(require("body-parser"));
const server = (0, express_1.default)();
server.use((0, cors_1.default)({
    exposedHeaders: "x-access-token",
}));
// Thiết lập middleware để phục vụ các tệp tĩnh từ thư mục 'public'
server.use("/", express_1.default.static("static"));
server.use(express_1.default.json());
server.disable("x-powered-by");
server.use((0, cookie_parser_1.default)());
server.use(express_1.default.urlencoded({ extended: false }));
server.use(body_parser_1.default.urlencoded({ extended: true }));
server.use("/comic", require("../routes/comic"));
// server.post("/compress", upload.array("images"), CompressingImages);
exports.default = server;
