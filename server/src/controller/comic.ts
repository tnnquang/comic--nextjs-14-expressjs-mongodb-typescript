import { isEmpty } from "lodash";

import instance from "../config/axiosIntance";
import CategoryModel from "../database/model/CategoryModel";
import {
  toCapitalize,
  convertToSlug,
  escapeRegex,
  getEndOfWeek,
  getStartOfWeek,
} from "../utilities";
import ComicModel from "../database/model/ComicModel";
import { Request, Response } from "express";
import { EnumComicText } from "../types/enum";

export async function getAllCategory() {
  try {
    const response = await instance
      .get("/the-loai")
      .then((value) => value.data);
    if (!isEmpty(response?.data?.items)) {
      const newData = response.data.items.map((item: any) => ({
        name: item.name,
        slug: item.slug,
      }));
      await CategoryModel.insertMany(newData);
      console.log("Insert list category success full");
    } else {
      console.log("List category is empty");
    }
  } catch (error) {
    console.log("Get list category was fail: ", error);
  }
}

export async function getAllCategoryClient(req: any, res: any) {
  const list = await CategoryModel.find({ isDeleted: false }).sort({ name: 1 });
  if (!list)
    return res.json({
      list: [],
    });
  const dataFormatted = list.map((e: any) => ({
    name: e.name,
    slug: e.slug,
    isDeleted: e.isDeleted,
  }));
  return res.json({
    list: dataFormatted,
  });
}

export async function findOneCategory(req: any, res: any) {
  try {
    const slug = req.query.slug;
    // console.log("eeeeee", req.query, req.params);
    const data = await CategoryModel.findOne({
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
  } catch (error: any) {
    return res.status(500).json({
      message: `Internal Server Error: ${error?.message ?? error}`,
      result: null,
      status: 500,
    });
  }
}

export async function checkAndAddCategories(categories: string[]) {
  try {
    for (const category of categories) {
      const tmp = category.trim();
      const existingCategory = await CategoryModel.findOne({
        name: { $regex: new RegExp(tmp), $options: "i" },
      });

      // Nếu chưa tồn tại, thêm mới vào database
      if (!existingCategory) {
        const newData = new CategoryModel({
          name: toCapitalize(tmp),
          slug: convertToSlug(tmp),
        });
        await newData.save();
        console.log(`Thêm mới category: ${category}`);
      } else {
        console.log(`Category đã tồn tại: ${category}`);
      }
    }

    console.log("Hoàn thành kiểm tra và thêm mới");
  } catch (error) {
    console.error("Lỗi kiểm tra và thêm mới category:", error);
  }
}

export async function getComicBySlug(req: Request, res: Response) {
  try {
    const _slug = req.body.slug;
    const chapterSlug = req.body.chapterSlug;
    const typeShow = req.body.type;
    const isSEOWithChapter = req.body.isSEOWithChapter;
    const ress = await ComicModel.findOne({
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
      const listChapters = ress.listChapters[0].chapters?.map((el) => {
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
    } else {
      const list = ress.listChapters;
      const chapter = list.map((value) => {
        const serverName = value.serverName;

        let currentChapterIndex = value.chapters.findIndex(
          (e) => e.slug === chapterSlug
        );

        if (currentChapterIndex === -1) {
          currentChapterIndex = 0;
        }
        const currentChapter = value.chapters[currentChapterIndex];
        const nextChapter = value.chapters[currentChapterIndex + 1];
        const previousChapter =
          currentChapterIndex > 0
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
        chapterName: `${value.chapterName}${
          !isEmpty(value.chapterTitle) ? `: ${value.chapterTitle}` : ""
        }`,
        slug: value.slug,
        totalImages: value.chapterImages.length,
      }));
      const {
        listChapters,
        _id,
        createdAt,
        updatedAt,
        rate,
        isDeleted,
        orginSlug,
        ...rest
      } = ress;

      if (isSEOWithChapter) {
        const chap = `${chapter[0].chapterData.chapterName}${
          chapter[0].chapterData.chapterTitle
            ? `: ${chapter[0].chapterData.chapterTitle}`
            : ""
        }`;

        return res.json({
          item: {
            ...rest,
            chap,
          },
        });
      }

      return res.json({ item: { ...rest, chapter, listChapters: chaps } });
    }
  } catch (error: any) {
    return res.json({
      item: null,
      error: `Internal Server Error: ${error?.message ?? error}`,
      code: 500,
    });
  }
}

/* Film filter with aggregation pipeline */
export async function getComicByFilter(req: any, res: any) {
  try {
    const limit = Number.isNaN(+req.body.limit) ? 20 : +req.body.limit;
    const { filters } = req.body;
    const { type, category, keyword, status, author, page } = filters;

    let current_page = 1;
    if (req.body.page) {
      current_page = Number.isNaN(+req.body.page) ? 1 : +req.body.page;
    } else if (page) {
      current_page = Number.isNaN(+page) ? 1 : +page;
    }

    const filtersFormatted: any = {};

    if (!isEmpty(category)) {
      if (Array.isArray(category)) {
        const categories = await Promise.all(
          category.map(async (cate) => {
            const data = await CategoryModel.findOne({
              $or: [
                { name: { $regex: new RegExp(cate.trim(), "i") } },
                { slug: cate },
              ],
            });
            return data ? data.name.trim() : null;
          })
        );
        filtersFormatted["categories"] = { $in: categories.filter(Boolean) };
      } else {
        const data = await CategoryModel.findOne({
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

    if (!isEmpty(author)) {
      filtersFormatted["author"] = {
        $in: Array.isArray(author)
          ? author.map((e: string) => e.trim())
          : [author.trim()],
      };
    }
    if (!isEmpty(status)) {
      if (Object.values(EnumComicText).includes(status)) {
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

    const matchStage: any = {
      ...filtersFormatted,
      isDeleted: false,
    };
    console.log("filter matchStage >> ", matchStage, keyword);

    if (keyword) {
      const kw = escapeRegex(keyword.trim()); // Xóa khoảng trắng và escape các ký tự đặc biệt
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

    const result = await ComicModel.aggregate(aggregationPipeline as any);

    const totalItems = result[0].totalItems[0]?.count || 0;
    const totalPages = Math.ceil(totalItems / limit);
    const data = result[0].data;

    res.json({
      result: data,
      totalItems,
      totalPages,
      currentPage: current_page,
    });
  } catch (error: any) {
    res.status(500).json({
      message: `Internal Server Error: ${error?.message ?? error}`,
      result: [],
    });
  }
}

export async function getComicsFromListCategory(req: any, res: any) {
  try {
    const listCategory = req.body.category;
    const _title = req.body.title;
    console.log("getComicsFromListCategory >> ", listCategory, _title);
    // console.log("hehehee", _title, listCategory)
    if (isEmpty(listCategory))
      return res.status(404).json({
        result: [],
        error: "There are no comic in the genre you requested",
        code: 404,
      });
    const promises = (listCategory as []).map((e: any) =>
      ComicModel.find({
        categories: { $in: [e] },
        isDeleted: false,
        title: { $ne: _title },
      })
        .limit(12)
        .sort({ updatedAt: -1 })
        .lean()
    );
    const ress = await Promise.all(promises);

    const formatData = (listCategory as []).map((e, i) => ({
      name: e,
      result: ress[i].map((value) => {
        const {
          title,
          titleSEO,
          slug,
          thumbnail,
          currentChapter,
          content,
          descriptionSEO,
        } = value;
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
  } catch (error: any) {
    return res.json({
      result: null,
      error: `Internal Server Error: ${error?.message ?? error}`,
      code: 500,
    });
  }
}

// export async function top10ComicsDaily(req: Request, res: Response) {
//   try {
//     const data = await ComicModel.aggregate([
//       // Unwind listChapters and chapters arrays
//       { $unwind: "$listChapters" },
//       { $unwind: "$listChapters.chapters" },

//       // Match documents where createdAt is within the last 24 hours
//       {
//         $match: {
//           "listChapters.chapters.createdAt": {
//             $gte: new Date(new Date().setHours(0, 0, 0, 0)), // Start of the day
//             $lt: new Date(new Date().setHours(23, 59, 59, 999)), // End of the day
//           },
//         },
//       },

//       // Group by comic id and sum the views
//       {
//         $group: {
//           _id: "$_id",
//           title: { $first: "$title" },
//           slug: { $first: "$slug" },
//           categories: { $first: "$categories" },
//           currentChapter: { $first: "$currentChapter" },
//           totalViews: { $sum: "$listChapters.chapters.views" },
//         },
//       },

//       // Sort by total views in descending order
//       { $sort: { totalViews: -1 } },

//       // Limit to top 10
//       { $limit: 10 },
//     ]);
//     if (data.length == 0 || !data) {
//       return res.json({ message: "Data daily is empty", result: null });
//     }
//     return res.json({ message: "Get data daily success", result: data });
//   } catch (error) {
//     return res.json({ message: "Get data daily error", result: null, error });
//   }
// }

// export async function top10ComicsWeekly(req: Request, res: Response) {
//   try {
//     const startOfWeek = getStartOfWeek();
//     const endOfWeek = getEndOfWeek();
//     const top10ComicsMonthly = await ComicModel.aggregate([
//       // Unwind listChapters and chapters arrays
//       { $unwind: "$listChapters" },
//       { $unwind: "$listChapters.chapters" },

//       // Match documents where createdAt is within the current month
//       {
//         $match: {
//           "listChapters.chapters.createdAt": {
//             $gte: startOfWeek,
//             $lt: endOfWeek,
//           },
//         },
//       },

//       // Group by comic id and sum the views
//       {
//         $group: {
//           _id: "$_id",
//           title: { $first: "$title" },
//           slug: { $first: "$slug" },
//           categories: { $first: "$categories" },
//           currentChapter: { $first: "$currentChapter" },
//           totalViews: { $sum: "$listChapters.chapters.views" },
//         },
//       },

//       // Sort by total views in descending order
//       { $sort: { totalViews: -1 } },

//       // Limit to top 10
//       { $limit: 10 },
//     ]);
//     if (top10ComicsMonthly.length == 0 || !top10ComicsMonthly) {
//       return res.json({ message: "Data monthly is empty", result: null });
//     }
//     return res.json({
//       message: "Get data monthly success",
//       result: top10ComicsMonthly,
//     });
//   } catch (error) {
//     return res.json({ message: "Get data monthly error", result: null, error });
//   }
// }

// export async function top10ComicsMonthly(req: Request, res: Response) {
//   try {
//     const top10ComicsMonthly = await ComicModel.aggregate([
//       // Unwind listChapters and chapters arrays
//       { $unwind: "$listChapters" },
//       { $unwind: "$listChapters.chapters" },

//       // Match documents where createdAt is within the current month
//       {
//         $match: {
//           "listChapters.chapters.createdAt": {
//             $gte: new Date(new Date().getFullYear(), new Date().getMonth(), 1), // Start of the month
//             $lt: new Date(
//               new Date().getFullYear(),
//               new Date().getMonth() + 1,
//               1
//             ), // Start of next month
//           },
//         },
//       },

//       // Group by comic id and sum the views
//       {
//         $group: {
//           _id: "$_id",
//           title: { $first: "$title" },
//           slug: { $first: "$slug" },
//           categories: { $first: "$categories" },
//           currentChapter: { $first: "$currentChapter" },
//           totalViews: { $sum: "$listChapters.chapters.views" },
//         },
//       },

//       // Sort by total views in descending order
//       { $sort: { totalViews: -1 } },

//       // Limit to top 10
//       { $limit: 10 },
//     ]);
//     if (top10ComicsMonthly.length == 0 || !top10ComicsMonthly) {
//       return res.json({ message: "Data monthly is empty", result: null });
//     }
//     return res.json({
//       message: "Get data monthly success",
//       result: top10ComicsMonthly,
//     });
//   } catch (error) {
//     return res.json({ message: "Get data monthly error", result: null, error });
//   }
// }

export async function updateChapterView(req: Request, res: Response) {
  try {
    // Tìm truyện và chương theo slug của truyện và chương
    const { comicSlug, chapterSlug } = req.body;
    if (!comicSlug || !chapterSlug) {
      return res.json({
        message: "Not found comic and chapter",
        result: false,
      });
    }
    const result = await ComicModel.findOneAndUpdate(
      {
        slug: comicSlug, // Tìm truyện theo slug
        "listChapters.chapters.slug": chapterSlug, // Tìm chương theo slug
      },
      {
        $inc: { "listChapters.$[].chapters.$[chapter].views": 1 }, // Tăng lượt xem lên 1
      },
      {
        arrayFilters: [{ "chapter.slug": chapterSlug }], // Lọc đúng chương cần cập nhật
        new: true, // Trả về tài liệu đã cập nhật
      }
    );

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
  } catch (error) {
    return res.json({ message: "Not found comic and chapter", result: false });
    console.error("Lỗi khi cập nhật lượt xem:", error);
  }
}

export async function getTop24NewPost(req: any, res: any) {
  try {
    const { limit } = req.body;
    const LIMIT_DEFAULT = +limit || 24;
    const result = await ComicModel.find({ isDeleted: false })
      .limit(LIMIT_DEFAULT)
      .sort({ createdAt: -1 })
      .lean();

    const data = result.map((e) => {
      const {
        title,
        originTitle,
        thumbnail,
        slug,
        status,
        currentChapter,
        author,
      } = e;
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
  } catch (error: any) {
    return res.json({
      result: [],
      message: "Internal Error Server: " + error.message,
    });
  }
}

export async function getTotalPageFromLimit(req: any, res: any) {
  try {
    const { limit } = req.query;
    const len = await ComicModel.countDocuments();
    const totalPages = Math.ceil(len / limit);
    return res.json({ result: totalPages });
  } catch (error) {
    res.json({ result: 0, message: error });
  }
}

export async function getAllSlug(req: any, res: any) {
  try {
    const { start, end } = req.query;
    const lstSlug = await ComicModel.find({}, "slug title updatedAt")
      .skip(start)
      .limit(parseInt(end) - parseInt(start))
      .lean();
    return res.json({
      result: lstSlug,
      message: "Fetch all slug successfully",
    });
  } catch (error: any) {
    return res.json({
      result: [],
      message: "Fetch all slug was failed. See error below",
      error: error,
    });
  }
}

// const getAggregationPipeline = (startDate: Date, endDate: Date) => [
//   { $unwind: "$listChapters" },
//   { $unwind: "$listChapters.chapters" },
//   {
//     $match: {
//       "listChapters.chapters.createdAt": {
//         $gte: startDate,
//         $lt: endDate,
//       },
//     },
//   },
//   {
//     $group: {
//       _id: "$_id",
//       title: { $first: "$title" },
//       slug: { $first: "$slug" },
//       categories: { $first: "$categories" },
//       currentChapter: { $first: "$currentChapter" },
//       totalViews: { $sum: "$listChapters.chapters.views" },
//     },
//   },
//   { $sort: { totalViews: -1 } },
//   { $limit: 10 },
// ];

const getAggregationPipeline = (startDate: Date, endDate: Date) => [
  {
    $match: {
      updatedAt: {
        $gte: startDate,
        $lt: endDate,
      },
    },
  },

  // Unwind listChapters và chapters array
  { $unwind: "$listChapters" },
  { $unwind: "$listChapters.chapters" },
  // Nhóm các truyện theo id và tổng views
  {
    $group: {
      _id: "$_id",
      title: { $first: "$title" },
      slug: { $first: "$slug" },
      thumbnail: { $first: "$thumbnail" },
      categories: { $first: "$categories" },
      currentChapter: {
        $first: "$currentChapter",
      },
      totalViews: {
        $sum: "$listChapters.chapters.views",
      },
    },
  },
  // Sắp xếp và lấy ra top theo giảm dần lượt view
  { $sort: { totalViews: -1 } },
  { $limit: 10 },
];

// const getAggregationPipeline = (startDate: Date, endDate: Date) => [
//   // Match những truyện có updatedAt trong khoảng thời gian chỉ định
//   {
//     $match: {
//       updatedAt: {
//         $gte: startDate,
//         $lt: endDate,
//       },
//     },
//   },
//   // Nhóm các truyện theo id và tính tổng số view của tất cả các chapter của truyện đó
//   {
//     $group: {
//       _id: "$_id",
//       title: { $first: "$title" },
//       slug: { $first: "$slug" },
//       categories: { $first: "$categories" },
//       currentChapter: { $first: "$currentChapter" },
//       totalViews: {
//         $sum: {
//           $reduce: {
//             input: "$listChapters.chapters",
//             initialValue: 0,
//             in: { $add: ["$$value", "$$this.views"] },
//           },
//         },
//       },
//     },
//   },
//   // Sắp xếp theo tổng số lượt view giảm dần
//   { $sort: { totalViews: -1 } },
//   // Lấy top 10 truyện
//   { $limit: 10 },
// ];

export async function top10ComicsDaily(req: Request, res: Response) {
  try {
    const startOfDay = new Date(new Date().setHours(0, 0, 0, 0));
    const endOfDay = new Date(new Date().setHours(23, 59, 59, 999));
    const data = await ComicModel.aggregate(
      getAggregationPipeline(startOfDay, endOfDay) as any[]
    );
    if (data.length === 0) {
      return res.json({ message: "Data daily is empty", result: null });
    }
    return res.json({ message: "Get data daily success", result: data });
  } catch (error) {
    return res.json({ message: "Get data daily error", result: null, error });
  }
}

export async function top10ComicsWeekly(req: Request, res: Response) {
  try {
    // Tính ngày hiện tại và 7 ngày trước
    const endDate = new Date();
    endDate.setHours(23, 59, 59, 999);
    const startDate = new Date();
    startDate.setDate(endDate.getDate() - 7);
    startDate.setHours(0, 0, 0, 0);
    const data = await ComicModel.aggregate(
      getAggregationPipeline(startDate, endDate) as any[]
    );
    if (data.length === 0) {
      return res.json({ message: "Data weekly is empty", result: null });
    }
    return res.json({ message: "Get data weekly success", result: data });
  } catch (error) {
    return res.json({ message: "Get data weekly error", result: null, error });
  }
}

export async function top10ComicsMonthly(req: Request, res: Response) {
  try {
    // Lấy ngày hiện tại
    const endDate = new Date();

    // Tính 30 ngày trước
    const startDate = new Date();
    startDate.setDate(endDate.getDate() - 30);
    const data = await ComicModel.aggregate(
      getAggregationPipeline(startDate, endDate) as any[]
    );
    if (data.length === 0) {
      return res.json({ message: "Data monthly is empty", result: null });
    }
    return res.json({ message: "Get data monthly success", result: data });
  } catch (error) {
    return res.json({ message: "Get data monthly error", result: null, error });
  }
}
