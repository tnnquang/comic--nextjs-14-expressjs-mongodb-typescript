import { isEmpty } from "lodash";
import axios from "./axiosInstance";
import {
  BASE_URL_API,
  BASE_URL_ADS,
  BASE_URL_FRONTEND_NO_PROTOCOL,
  GET_COMIC_BY_FILTER,
  GET_COMIC_FROM_SLUG,
  GET_HIGH_RATE,
  TOTAL_STAR,
  fetchOrigin,
  isBrowser,
  IMAGE_BASE_URL,
  GET_NEW_COMIC,
  TOP10_HIGHEST_DAILY,
  TOP10_HIGHEST_MONTHLY,
  TOP10_HIGHEST_WEEKLY,
} from "./constant";
import axiosInstance from "./axiosInstance";

export function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export function getElement(classOrId: string) {
  const el = document.querySelector(classOrId);
  return el;
}

export function getAllElement(classOrTag: string) {
  const els = document.querySelectorAll(classOrTag);
  return Array.from(els) as HTMLElement[];
}

export function isAlphabetic(str: string): boolean {
  // Kiểm tra xem chuỗi chỉ chứa các ký tự thuộc bảng chữ cái Latinh
  return /^[a-zA-Z0-9\s]+$/.test(str);
}

export function convertToSlug_v2(text: string) {
  return text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[đĐ]/g, (char) => (char === "đ" ? "d" : "D"))
    .replace(/[^a-z0-9]/g, "-");
}


export function convertAlphabetToSlug(str: string) {
  // Chuyển hết sang chữ thường
  str = str.toLowerCase();

  // xóa dấu
  str = str
    .normalize("NFD") // chuyển chuỗi sang unicode tổ hợp
    .replace(/[\u0300-\u036f]/g, ""); // xóa các ký tự dấu sau khi tách tổ hợp

  // Thay ký tự đĐ
  str = str.replace(/[đĐ]/g, "d");

  // Xóa ký tự đặc biệt
  str = str.replace(/([^0-9a-z-\s])/g, "");

  // Xóa khoảng trắng thay bằng ký tự -
  str = str.replace(/(\s+)/g, "-");

  // Xóa ký tự - liên tiếp
  str = str.replace(/-+/g, "-");

  // xóa phần dư - ở đầu & cuối
  str = str.replace(/^-+|-+$/g, "");

  // return
  return str;
}

export function convertToSlug(str: string) {
  if (isAlphabetic(str)) {
    return convertAlphabetToSlug(str);
  }
  return str
    .toLowerCase()
    .replace(/\s+/g, "-") // Thay khoảng trắng bằng dấu gạch ngang
    .replace(/-+/g, "-") // Xóa dấu gạch ngang liên tiếp
    .replace(/^-+|-+$/g, ""); // Xóa dấu gạch ngang ở đầu và cuối
}


export function toCapitalize(inputText: string) {
  // Tách đoạn văn bản thành các từ
  const words = inputText.split(" ");

  // Lặp qua từng từ và chuyển đổi chữ cái đầu thành chữ hoa
  const capitalizedWords = words.map((word) => {
    // Nếu từ rỗng, không cần chuyển đổi
    if (word.length === 0) {
      return "";
    }

    // Chuyển đổi chữ cái đầu của từ
    const capitalizedWord =
      word.charAt(0).toUpperCase() + word.slice(1).toLocaleLowerCase();

    return capitalizedWord;
  });

  // Kết hợp lại các từ thành đoạn văn bản mới
  const resultText = capitalizedWords.join(" ");

  return resultText;
}

export function formatNumber(num: number | undefined) {
  if (!num) return 0;
  if (Number.isNaN(num)) return 0;
  if (num >= 1000) {
    // Chuyển số thành dạng K, ví dụ: 1000 => 1K, 3600 => 3.6K
    return (num / 1000).toFixed(1) + "K";
  }
  // Trả về số nguyên nếu số không đạt yêu cầu
  return num.toString();
}

export const toStar = (rate: any) => {
  if (isEmpty(rate)) return `0/${TOTAL_STAR}`;
  const x = (
    rate.reduce((acc: any, current: any) => acc + current.star_number, 0) /
    rate.length
  ).toFixed(1);
  if (Number.isNaN(x)) {
    return `0/${TOTAL_STAR}`;
  }
  return `${x}/${TOTAL_STAR}`;
};

export function formatDateTime(dateTimeString: string) {
  return new Date(dateTimeString).toLocaleString("vi-VN", {
    hour: "numeric",
    minute: "numeric",
    second: "numeric",
    day: "numeric",
    month: "numeric",
    year: "numeric",
    timeZone: "UTC",
  });
}

export function calculateStatus(
  current_episode: any,
  totalEpisode: any, //number
  quality?: any
) {
  if (quality === "Trailer") return quality;
  if (totalEpisode === "Tập FULL" || totalEpisode == 1) {
    return "Tập FULL";
  }
  let total = 0;
  if (totalEpisode.trim().toLowerCase().endsWith("tập")) {
    total = +totalEpisode.trim().toLowerCase().split("tập")[0];
  } else {
    total = +totalEpisode.trim();
  }

  if (+current_episode >= +total && total != 0) {
    return `Hoàn tất ${+total}/${+total}`;
  } else if (
    totalEpisode === "?" ||
    totalEpisode === "??" ||
    totalEpisode == 0
  ) {
    return `Tập ${current_episode}`;
  } else if (+current_episode < +total) {
    return `Tập ${current_episode}/${+total}`;
  } else {
    return "Không xác định";
  }
}

export function getValueCategory(label: string) {
  if (!label) return;
  const result = label.toLowerCase().trim().replace(" ", "-");
  return result;
}

export const getDataFromSlug = async (slug: string): Promise<any | null> => {
  const ress = await axiosInstance.post(
    GET_COMIC_FROM_SLUG,
    { slug: slug },
    {
      headers: {
        "Content-Type": "application/json",
      },
    }
  );
  if (ress.status != 200) return null;
  return ress.data.item;
};

export async function getDataFromSlugWithChapter(
  slug: string | null | undefined,
  chapterSlug: string | null | undefined,
  isSEOWithChapter = false
): Promise<any | null> {
  if (!chapterSlug || !slug) return null;
  const ress = await axiosInstance.post(
    GET_COMIC_FROM_SLUG,
    { slug: slug, chapterSlug, isSEOWithChapter },
    {
      headers: {
        "Content-Type": "application/json",
      },
    }
  );
  if (ress.status != 200) return null;
  return ress.data.item;
}

export async function getListCategory(): Promise<any[]> {
  try {
    let dataList = [];
    const list = await axios.get("/comic/category-client");
    if (!isEmpty(list.data.list)) {
      const lst = list.data.list.map((e: any) => ({
        label: e.name,
        value: e.slug,
        isDeleted: e.isDeleted,
        slug: e.slug,
      }));
      dataList = lst;
    } else {
      dataList = [];
    }
    return dataList;
  } catch (error: any) {
    console.log("Error get list category: ", error);
    return [];
  }
}

// export async function getSomeCategory(categories: any[]) {
//   const list = Array.isArray(categories) ? categories : [categories];
// }

export async function deleteCategory(category: string) {
  let res = false;
  const response = await axios.post("/comic/category/delete", {
    category: category,
  });
  if (response.data) {
    res = response.data.result;
  } else {
    res = false;
  }
  return res;
}

export async function createCategory(categories: string[]) {
  let res = false;
  const response = await axios.post("/comic/category/create", {
    category: categories,
  });
  if (response.data) {
    res = response.data.result;
  } else {
    res = false;
  }
  return res;
}

export async function getListCountry() {
  try {
    let dataList = [];
    const list = await axios.get("/comic/country");
    if (!isEmpty(list.data.listCountry)) {
      const lst = list.data.listCountry.map((e: any) => ({
        label: e.name,
        value: e.slug,
        isDeleted: e.isDeleted,
        slug: e.slug,
      }));
      dataList = lst;
    } else {
      dataList = [];
    }
    return dataList;
  } catch (error: any) {
    console.log("Error get list country: ", error);
    return [];
  }
}

export async function getListQuality() {
  try {
    let dataList = [];
    const list = await axios.get("/comic/quality");
    if (!isEmpty(list.data.listQuality)) {
      const lst = list.data.listQuality.map((e: any) => ({
        label: e.name,
        value: e.name,
        isDeleted: e.isDeleted,
      }));
      dataList = lst;
    } else {
      dataList = [];
    }
    return dataList;
  } catch (error: any) {
    console.log("Error get list quality: ", error);
    return [];
  }
}

export async function getListLanguage() {
  try {
    let dataList = [];
    const list = await axios.get("/comic/language");
    if (!isEmpty(list.data.listLanguage)) {
      const lst = list.data.listLanguage.map((e: any) => ({
        label: e.name,
        value: e.name,
        isDeleted: e.isDeleted,
      }));
      dataList = lst;
    } else {
      dataList = [];
    }
    return dataList;
  } catch (error: any) {
    console.log("Error get list language: ", error);
    return [];
  }
}
// export async function getListFilm(url: string, filters?: any) {
//   const result = await axios.post(url, filters ?? {}, {
//     headers: {
//       "Content-Type": "application/json",
//     },
//   });
//   if (!isEmpty(result.data)) {
//     return result.data;
//   } else return null;

// }

export async function getListFilm(url: string, filters?: any) {
  try {
    // console.log("hehehe >>", filters)
    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...fetchOrigin,
      },
      body: JSON.stringify(filters ?? {}),
      next: { revalidate: 900, tags: ["phim-tinh-cam"] }, // xác thực lại dữ liệu trong vòng 15 phút
    });

    if (!response.ok) {
      return [];
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const jsonData = await response.json();

    if (!isEmpty(jsonData.result)) {
      return jsonData.result;
    } else {
      return [];
    }
  } catch (error) {
    // console.error('An error occurred:', error);
    return [];
  }
}

export async function getListData_v1() {
  const listCategory = await getListCategory();
  const listCountry = await getListCountry();
  const listQuality = await getListQuality();
  return { listCategory, listCountry, listQuality };
}

export async function getListData() {
  try {
    const [listCategory] = await Promise.allSettled([getListCategory()]);
    return { listCategory };
  } catch (error) {
    console.error("Error fetching data:", error);
    return { listCategory: [], listCountry: [], listQuality: [] };
  }
}
export async function fetchDataListCartoon() {
  const res = await fetch(`${BASE_URL_API}${GET_COMIC_BY_FILTER}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...fetchOrigin,
    },
    body: JSON.stringify({
      filters: { category: ["Hoạt Hình"], quality: { $ne: "Trailer" } },
      limit: 12,
    }),
    next: { revalidate: 1800, tags: ["list-film-cartoon"] },
  });
  if (res.ok) {
    const data_tmp = await res.json();
    return data_tmp;
  } else {
    return {
      result: [],
      totalPages: 0,
      currentPage: 1,
    };
  }
}

export async function fetchDataListFromAnyCategory(
  categoryName: string | string[],
  isNewPost = false
) {
  const cate = typeof categoryName === "string" ? [categoryName] : categoryName;
  let res: Response;
  if (isNewPost) {
    res = await fetch(`${BASE_URL_API}${GET_NEW_COMIC}`, {
      method: "POST",
      body: JSON.stringify({ limit: 10 }),
    });
  } else {
    res = await fetch(`${BASE_URL_API}${GET_COMIC_BY_FILTER}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...fetchOrigin,
      },
      body: JSON.stringify({
        filters: {
          categories: { $in: [...cate] },
          // quality: { $ne: "Trailer" },
        },
        limit: 12,
      }),
      next: { revalidate: 1800, tags: ["list-comic-custom"] },
    });
  }
  if (res.ok) {
    const data_tmp = await res.json();
    if (data_tmp.result.length > 0) {
      if (data_tmp.result.length > 12) {
        let { result, ...rest } = data_tmp;

        result = result.slice(0, 12);
        return { result, ...rest };
      }
      return data_tmp;
    }
    return data_tmp;
  } else {
    return {
      result: [],
      totalPages: 0,
      currentPage: 1,
    };
  }
}

export async function fetchDataHighRate() {
  const res = await fetch(`${BASE_URL_API}${GET_HIGH_RATE}`, {
    method: "POST",
    headers: {
      ...fetchOrigin,
    },
    next: { revalidate: 3600, tags: ["high-rate"] },
  });

  if (res.ok) {
    const data = await res.json();
    return data;
  } else {
    return { result: [] };
  }
}

export async function returnDefaultImageURL(thumbnail: string) {
  const imgSrc = isEmpty(thumbnail) ? "/blur_img.webp" : thumbnail;
  if (imgSrc === "/blur_img.webp") {
    return imgSrc;
  }
  let urlFetch = "";
  if (imgSrc.startsWith("http")) {
    urlFetch = imgSrc;
  } else {
    urlFetch = `${BASE_URL_API}/${imgSrc}`;
  }

  const fetchImg = await fetch(urlFetch, {
    headers: { ...fetchOrigin },
  });
  if (!fetchImg.ok) {
    return "/bg-match-item.png";
  } else {
    if (imgSrc.startsWith("http")) {
      return imgSrc;
    } else {
      return `${BASE_URL_API}/${imgSrc}`;
    }
  }
}

export function returnDefaultImageURL_v2(thumbnail: string) {
  // return "/bg-match-item.png";
  // return "/blur_img.webp";
  const imgSrc = isEmpty(thumbnail)
    ? "/blur_img.webp"
    : thumbnail === "https://phim.nguonc.com"
    ? "/bg-match-item.png"
    : thumbnail.startsWith("http")
    ? thumbnail
    : `${IMAGE_BASE_URL}/${thumbnail}`;
  return imgSrc;
  if (imgSrc === "/blur_img.webp") {
    return imgSrc;
  }
  let urlFetch = "";
  if (imgSrc.startsWith("http")) {
    urlFetch = imgSrc;
  } else {
    urlFetch = `${IMAGE_BASE_URL}/${imgSrc}`;
  }

  return urlFetch;
}

export function formatPlayedTime(
  seconds: number | string,
  isShowFull?: boolean
) {
  const days = Math.floor(+seconds / 86400);
  const hours = Math.floor((+seconds % 86400) / 3600);
  const minutes = Math.floor((+seconds % 3600) / 60);
  const sec = Math.floor(+seconds % 60);

  let timeString;
  if (isShowFull === true) {
    timeString = `${days > 0 ? days + " ngày " : ""}${
      hours > 0 ? hours + " giờ " : ""
    }${minutes > 0 ? minutes + " phút " : ""}${sec} giây`;
  } else {
    timeString = `${days >= 1 ? `${days}:` : ""}${
      hours > 0 ? `${hours}:` : ""
    }${minutes > 0 ? `${minutes}` : "00"}:${sec > 0 ? `${sec}` : "00"}`;
  }

  return timeString;
}

export function playingTimeOnDuration(played: string, duration: string) {
  return `${played} / ${duration}`;
}

export function scrollToTop(top?: number) {
  if (isBrowser) {
    window.scrollTo({ top: top || 0, behavior: "smooth" });
  }
}

export function getFullDate(time: string | number) {
  // ví dụ time = 2024-03-30T12:30:00.000000Z
  // console.log("time string: ", time)
  const date = new Date(time);
  // console.log("trong ham: ", date);
  const fullDay = date.getDate() < 10 ? `0${date.getDate()}` : date.getDate();
  const fullMonth =
    date.getMonth() + 1 < 10 ? `0${date.getMonth() + 1}` : date.getMonth() + 1;
  const hours = date.getHours() < 10 ? `0${date.getHours()}` : date.getHours();
  const minutes =
    date.getMinutes() < 10 ? `0${date.getMinutes()}` : date.getMinutes();
  return {
    fullDateTime: `${fullDay}/${fullMonth}/${date.getFullYear()} - ${hours}h:${minutes}'`,
    fullTimeDate: `${hours}h:${minutes}' - ${fullDay}/${fullMonth}/${date.getFullYear()}`,
    fullDMY: `${fullDay}/${fullMonth}/${date.getFullYear()}`,
    fullYMDNotSlash: `${date.getFullYear()}${fullMonth}${fullDay}`,
    time: `${hours}h:${minutes}`,
    date,
    fullDay,
    fullMonth,
    hours,
    minutes,
    years: date.getFullYear(),
    miliseconds: date.getMilliseconds(),
    dayMonth: `${fullDay}/${fullMonth}`,
  };
}

export async function fetchAds() {
  // return null;
  const ress = await fetch(
    `${BASE_URL_ADS}?domain=${BASE_URL_FRONTEND_NO_PROTOCOL}`,
    {
      cache: "no-store",
    }
  );
  if (ress.ok) {
    const jsonData = await ress.json();
    const ads: any[] = jsonData.ads;
    if (!isEmpty(ads)) {
      return {
        header: ads.find((e: any) => e.position === "header") || [],
        footer: ads.find((e: any) => e.position === "footer") || [],
        row1: ads.find((e: any) => e.position === "row1") || [],
        row2: ads.find((e: any) => e.position === "row2") || [],
        row3: ads.find((e: any) => e.position === "row3") || [],
        slide: ads.find((e: any) => e.position === "slide") || [],
        popup: ads.find((e: any) => e.position === "popup") || [],
        list_app: ads.find((e: any) => e.position === "list_app") || [],
        in_player: ads.find((e: any) => e.position === "in_player") || [],
      };
    }
  }
  return {
    header: null,
    footer: null,
    row1: null,
    row2: null,
    row3: null,
    slide: null,
    popup: null,
    list_app: null,
    in_player: null,
  };
}

export function formatCollectionByStartChar(arr: string[]) {
  if (!arr) return {};
  const sortedObj: any = {};

  arr.forEach((el) => {
    const startChar = el.charAt(0).toUpperCase();
    if (/^[A-Z]$/.test(startChar)) {
      if (sortedObj[startChar]) {
        sortedObj[startChar]?.push(el);
      } else {
        sortedObj[startChar] = [el];
      }
    } else {
      if (sortedObj["Synthetic"]) {
        sortedObj["Synthetic"]?.push(el);
      } else {
        sortedObj["Synthetic"] = [el];
      }
    }
  });
  const keys = Object.keys(sortedObj).sort((a, b) => a.localeCompare(b));

  const sortedActorsArray = Object.entries(sortedObj).map(
    ([character, list]) => {
      return { character, list };
    }
  );
  const sorted = sortedActorsArray.sort((a, b) =>
    a.character.localeCompare(b.character)
  );

  return {
    listChars: keys,
    data: sorted,
  };
}

export function arrayAtoZ() {
  const alphabet = Array.from({ length: 26 }, (_, i) =>
    String.fromCharCode(65 + i)
  );
  return alphabet;
}

// Hàm để escape các ký tự đặc biệt
export function escapeRegex(keyword: string) {
  return keyword.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"); // $& là chuỗi khớp với toàn bộ regex
}

export async function getDataHighestView() {
  const endpoints = [
    TOP10_HIGHEST_DAILY,
    TOP10_HIGHEST_WEEKLY,
    TOP10_HIGHEST_MONTHLY,
  ];

  const [listDaily, listWeekly, listMonthly] = await Promise.all(
    endpoints.map((endpoint) =>
      axiosInstance.post(endpoint).then((response) => response.data.result)
    )
  );

  return { listDaily, listWeekly, listMonthly };
}