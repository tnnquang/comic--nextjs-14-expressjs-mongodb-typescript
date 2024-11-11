import { isEmpty } from "lodash";
import instance from "../config/axiosIntance";
import {
  addKeywords,
  convertToSlug,
  retryWithExponentialBackoff,
} from "../utilities";
import { downloadAndProcessImage } from "../middlewares/processImage";
import ComicModel from "../database/model/ComicModel";
import { generateRandomRates, generateRandomViews } from "../utilities/fake";
import { ObjectWithKey, TypeComicSlug } from "../types";

const maxRetry = 3;

export function generateStatus(originText: string) {
  if (originText === "ongoing") return "Đang phát hành";
  if (originText === "completed") {
    return "Đã hoàn thành";
  }
  if (originText === "coming_soon") {
    return "Sắp ra mắt";
  }
  return "Đã hoàn thành";
}

function correctChapterApiDataURL(url: string) {
  // Định dạng đúng của URL
  const correctFormat =
    /^https:\/\/sv1\.otruyencdn\.com\/v1\/api\/chapter\/[a-fA-F0-9]{24}$/;

  // Kiểm tra URL có đúng định dạng không
  if (correctFormat.test(url)) {
    return url; // URL đã đúng, trả về như cũ
  } else {
    // Tìm phần chính xác của mã hash (24 ký tự đầu tiên)
    const baseURL = "https://sv1.otruyencdn.com/v1/api/chapter/";
    const hashPart = url.replace(baseURL, "").slice(0, 24);

    // Kết hợp lại thành URL đúng
    return baseURL + hashPart;
  }
}

export async function getChapterApiData(
  apiLink: string,
  originLink: string
): Promise<any> {
  try {
    const link = correctChapterApiDataURL(apiLink);
    const chapterJsonData = await fetch(link).then((value) => value.json());
    const data = chapterJsonData?.data;

    let obj: ObjectWithKey = {};
    const cdnPath = "https://sv1.otruyencdn.com" + "/" + data.item.chapter_path;
    const chapterImages = data.item.chapter_image;
    obj["CDNPath"] = cdnPath;
    obj["chapterImages"] = chapterImages.map((e: any) => ({
      imageFile: e.image_file,
      imagePage: e.image_page,
    }));
    obj["originLink"] = link;
    return obj;

    // console.log(
    //   "Error: Can not request getChapterApiData >> ",
    //   chapterJsonData
    // );
  } catch (error) {
    console.log(
      "Catch error getChapterApiData, retrying >> ",
      apiLink,
      originLink
    );
    return await retryWithExponentialBackoff(
      () => getChapterApiData(apiLink, originLink),
      3,
      1000
    );
  }
}

export async function parseListChapterServer(
  listChapters: any,
  link: string
): Promise<any> {
  try {
    console.log(
      "parseListChapterServer: Handle list chapters server >> ",
      link
    );
    if (!Array.isArray(listChapters)) {
      throw new Error("Invalid input: listChapters must be an array.");
    }

    const dataParsed = [];
    for (const chap of listChapters) {
      const serverData = chap.server_data;

      const chapters = [];
      for (const ep of serverData) {
        let obj: ObjectWithKey = {};
        const chapterName = !Number.isNaN(parseFloat(ep.chapter_name))
          ? `Chapter ${ep.chapter_name}`
          : ep.chapter_name;
        const chapterTitle = ep.chapter_title;

        obj["chapterTitle"] = chapterTitle;
        obj["chapterName"] = chapterName;
        obj["slug"] = convertToSlug(chapterName);
        const chapterApiData = await getChapterApiData(
          ep.chapter_api_data,
          link
        );
        obj["views"] = generateRandomViews();
        if (!chapterApiData) {
          console.log("Data of function getChapterApiData return null");
        } else {
          chapters.push({ ...obj, ...chapterApiData });
        }
      }
      dataParsed.push({ serverName: chap.server_name, chapters: chapters });
    }

    return dataParsed;
  } catch (error: any) {
    // Handle the error (e.g., return a default value or rethrow)
    console.error(
      "Error in parseListChapterServer >> ",
      link,
      " >> ",
      error.message
    );
    return await retryWithExponentialBackoff(
      () => parseListChapterServer(listChapters, link),
      3,
      1000
    );

    return null; // Return null after 3 unsuccessful retries
    throw error;
  }
}

export async function getDataComic(link: string, rejectImage = false) {
  try {
    if (!link) return null;
    console.log("getDataComic >> ", link);
    const response = await instance.get(link);
    const data = response.data?.data;
    if (!isEmpty(data?.item)) {
      const titleSEO = data.seoOnPage.titleHead || "";
      const descriptionSEO = data.seoOnPage.descriptionHead || "";
      const thumbnail = rejectImage
        ? ""
        : await downloadAndProcessImage(
            data.seoOnPage.seoSchema.image,
            "thumbnail",
            data.item.name
          );
      const title = data.item.name;
      const content = data.item.content;
      const slug = convertToSlug(data.item.name);
      const originTitle = data.item.origin_name;
      const categories = data.item.category.map((e: any) => e.name);
      const author = data.item.author;
      const currentChapter = data.item.chapters[0]?.server_data?.length || 0;
      const status = generateStatus(data.item.status);
      const listChapters = await parseListChapterServer(
        data.item.chapters,
        link
      );
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
        rate: generateRandomRates(),
        keywords: addKeywords(
          originTitle && !isEmpty(originTitle[0])
            ? [title, originTitle.join(",")]
            : title
        ),
      };
    }
  } catch (error: any) {
    console.error("Error (catch) in getDataComic:", error.message);
    for (let retry = 0; retry < maxRetry; retry++) {
      try {
        console.log(`getDataComic: Retrying (attempt ${retry + 1})...`);
        const result: any = await getDataComic(link, rejectImage);
        if (result) {
          return result;
        }
      } catch (retryError: any) {
        console.error(
          "Retry failed in function getDataComic:",
          retryError.message
        );
      }
    }
    return null; // Return null after 3 unsuccessful retries
  }
}

export async function getDataForType(
  type: TypeComicSlug,
  from?: number,
  to?: number,
  isAll = false
) {
  try {
    const pagination = await instance
      .get(`/danh-sach/${type}`)
      .then((response) => response.data.data)
      .then((value) => {
        return value.params.pagination;
      });
    const totalPage = Math.ceil(
      pagination.totalItems / pagination.totalItemsPerPage
    );
    const start = from || 1;
    const end = isAll ? totalPage : to || 5;
    console.log(
      `----------Start crawl OTruyen with type ${type} from page ${start} to ${end}----------`
    );
    for (let i = 1; i <= end; i++) {
      const operations = [];
      try {
        const response = await instance.get(`/danh-sach/${type}?page=${i}`);
        const data = response.data;
        if (!isEmpty(data?.data?.items)) {
          for (const item of data.data.items) {
            const exist = await ComicModel.findOne({ title: item.name.trim() });
            const slug = item.slug;

            if (!exist) {
              console.log("Get data comic for insert new comic");
              const dataComic = await getDataComic(`/truyen-tranh/${slug}`);
              if (dataComic) {
                const operator = {
                  insertOne: {
                    document: dataComic,
                  },
                };
                operations.push(operator);
                console.log("Add to attempt array: ", item.name);
              }
            } else {
              console.log("Check for update data comic was existent");
              if (exist.status === "Đã hoàn thành") {
                console.log("Truyện đã hoàn tất, qua truyện khác");
                return;
              }
              const dataComic = await getDataComic(
                `/truyen-tranh/${slug}`,
                true
              );
              if (dataComic) {
                let obj: ObjectWithKey = {};
                if (dataComic.status !== exist.status) {
                  obj["status"] = dataComic.status;
                }
                if (
                  JSON.stringify(dataComic.author) !==
                  JSON.stringify(exist.author)
                ) {
                  obj["author"] = dataComic.author;
                }
                if (
                  JSON.stringify(dataComic.categories) !==
                  JSON.stringify(exist.categories)
                ) {
                  obj["categories"] = dataComic.categories;
                }
                if (dataComic.currentChapter !== exist.currentChapter) {
                  obj["currentChapter"] = dataComic.currentChapter;
                }
                obj["listChapters"] = dataComic?.listChapters;
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
          await ComicModel.bulkWrite(operations);
          console.log(`Inserted page ${i}`);
        }
      } catch (error:any) {
        console.log(`Error with page ${i} when get data comic: `, error?.message);
      }
    }
  } catch (error:any) {
    console.log("getDataForType was not failed: ", error?.message, ">> link >>", );
  }
}

export async function crawlFromOTruyen(from = 1, to: number, isAll = false) {
  try {
  } catch (error) {}
}
