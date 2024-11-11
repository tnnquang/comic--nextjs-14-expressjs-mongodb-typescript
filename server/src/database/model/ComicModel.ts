import { model, Schema } from "mongoose";

const itemRate = new Schema(
  {
    star_number: {
      type: Number,
      required: false,
    },
    option: {
      type: [],
      required: false,
    },
  },
  { timestamps: true }
);

const itemChapter = new Schema(
  {
    views: {
      type: Number,
      required: false,
      default: 2500,
    },
    chapterTitle: {
      type: String,
      required: false,
    },
    chapterName: {
      type: String,
      required: true,
    },
    originLink: {
      type: String,
      required: false,
      default: "",
    },
    slug: {
      type: String,
      required: true,
    },
    CDNPath: {
      type: String,
      required: true,
    },
    chapterImages: {
      type: [],
      required: true,
    },
  },
  { timestamps: true }
);

const itemListChapters = new Schema({
  serverName: {
    type: String,
    required: true,
  },
  chapters: {
    type: [itemChapter],
    required: true,
  },
});

const ComicModel = new Schema(
  {
    title: {
      type: String,
      required: true,
      unique: true,
    },
    originTitle: {
      type: [],
      required: false,
      default: [],
    },
    titleSEO: {
      type: String,
      required: false,
      default: "",
    },
    descriptionSEO: {
      type: String,
      required: false,
      default: "",
    },
    content: {
      type: String,
      required: false,
      default: "",
    },
    thumbnail: {
      type: String,
      required: true,
      unique: true,
    },
    slug: {
      type: String,
      required: true,
      unique: true,
    },
    author: {
      type: [],
      default: [],
    },
    categories: {
      type: [],
      default: [],
    },
    currentChapter: {
      type: Number,
      required: false,
      default: 0,
    },
    listChapters: {
      type: [itemListChapters],
      default: [],
    },
    status: {
      type: String,
    },
    orginSlug: {
      type: String,
      default: "",
    },
    keywords: {
      type: [],
      default: [],
    },
    notify: {
      type: [],
      default: [],
    },
    rate: {
      type: [itemRate],
      required: false,
    },
    isDeleted: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

ComicModel.index({ updatedAt: 1 });

export default model("Comics", ComicModel, "Comics");
