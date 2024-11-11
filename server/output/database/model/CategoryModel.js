"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = require("mongoose");
const CategoryModel = new mongoose_1.Schema({
    name: {
        type: String,
        required: true,
    },
    slug: {
        type: String,
        unique: true,
        required: true,
    },
    isDeleted: {
        type: Boolean,
        default: false,
        required: false,
    },
}, { timestamps: true });
exports.default = (0, mongoose_1.model)("Category", CategoryModel, "Category");
