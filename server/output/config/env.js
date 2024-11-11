"use strict";
var _a;
Object.defineProperty(exports, "__esModule", { value: true });
exports.PATH_STATIC_IMAGE = exports.PORT = exports.SECRET_ACCESS_TOKEN = exports.URI = void 0;
const dotenv_1 = require("dotenv");
(0, dotenv_1.config)();
_a = process.env, exports.URI = _a.URI, exports.SECRET_ACCESS_TOKEN = _a.SECRET_ACCESS_TOKEN, exports.PORT = _a.PORT, exports.PATH_STATIC_IMAGE = _a.PATH_STATIC_IMAGE;
