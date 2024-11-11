import { model, Schema } from "mongoose";

const CategoryModel = new Schema(
  {
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
  },
  { timestamps: true }
);

export default model("Category", CategoryModel, "Category");
