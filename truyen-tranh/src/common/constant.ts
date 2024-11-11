import configURI from "@/configs/configURI.json";

export const PROD = process.env.NODE_ENV === "production";
export const isBrowser = typeof window !== "undefined";
export const BASE_URL_API = PROD
  ? configURI.api.production
  : configURI.api.devlopment;

export const BASE_URL_FRONTEND = PROD
  ? configURI.frontend.production
  : configURI.frontend.devlopment;

export const BASE_URL_ADS = PROD
  ? configURI.ads.production
  : configURI.ads.devlopment;

export const IMAGE_BASE_URL = PROD
  ? configURI.image.production
  : configURI.image.devlopment;

export const BASE_URL_FRONTEND_NO_PROTOCOL = configURI.baseUrlNoProtocol;
export const acceptImage =
  "image/png,image/jpeg,image/webp,image/tiff,image/avif";
export const acceptVideo = "video/mp4,video/mkv";
export const VIDEO_API_KEY = "123774v9eris7ejjr68vkb";
export const DEFAULT_HEIGHT_INPUT = "40px";
export const TOTAL_STAR = 10;
export const DEFAULT_ITEMS = 20;

export const KEYWORDS = [
  "phim hay",
  "phim vietsub",
  "phim hd",
  "phim lồng tiếng",
  "phim trung quốc",
  "phim việt nam",
  "phim hay hd",
  "phim cập nhật nhanh",
  "tv show",
  "chương trình",
  "phim tình cảm",
  "phim kiếm hiệp",
  "phim đam mỹ",
  "phim boy love",
  "yu thánh thiện",
  "phim hàn quốc",
  "tình cảm hàn quốc",
  "phim hoạt hình",
  "phim kiếm hiệp",
  "phim kinh dị",
  "phim ma",
  "tâm lý tình cảm",
  "khoa học viễn tưởng",
  "khoa hoc vien tuong",
  "hd phim hay",
  "phim cập nhật nhanh",
  "thần tiên",
  "hoạt hình",
  "âu mỹ",
  "ác quỷ ma sơ",
  "indisious",
  "phim hành động",
  "châu tinh trì",
  "cảnh sát",
  "phim 18+",
  "18+",
  "phim thần thoại",
];

/* API ENDPOINT */

export const GET_DATA_FROM_LIST_CATEGORY = "/comic/comic-of-list-category";
export const GET_COMIC_FROM_SLUG = "/comic/slug";
export const GET_COMIC_BY_FILTER = "/comic/filter";
export const GET_NEW_COMIC = "/comic/new-post";
export const GET_COMIC_COMMING_SOON = "/comic/comming-soon";
export const GET_HIGH_RATE = "/comic/high-rate-comic";
export const HOT_COMIC = "/comic/hot-comic";
export const GET_COMMENT = "/comic/get-comment";
export const GET_ADS = "/ads/get-all";
export const GET_ONE_CATEGORY = "/comic/category-one";
export const GET_ONE_COUNTRY = "/comic/country-one";
export const UPDATE_VIEW = "/comic/update-chapter-view";
export const TOP10_HIGHEST_DAILY="/comic/list-highest-views-daily"
export const TOP10_HIGHEST_WEEKLY="/comic/list-highest-views-weekly"
export const TOP10_HIGHEST_MONTHLY="/comic/list-highest-views-monthly"
export const GET_HOT_COMIC = "/comic/hot";
export const GET_LIST_PERFORMER = "/comic/list-author";

export const fetchOrigin = {
  "Access-Control-Allow-Origin": BASE_URL_FRONTEND,
  "Access-Control-Allow-Methods": "GET,PUT,POST,DELETE,PATCH,OPTIONS",
};
