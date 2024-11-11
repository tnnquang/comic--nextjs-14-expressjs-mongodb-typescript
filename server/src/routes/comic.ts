import express from "express";
import {
  findOneCategory,
  getAllCategoryClient,
  getAllSlug,
  getComicByFilter,
  getComicBySlug,
  getComicsFromListCategory,
  getTop24NewPost,
  getTotalPageFromLimit,
  top10ComicsDaily,
  top10ComicsMonthly,
  top10ComicsWeekly,
  updateChapterView,
} from "../controller/comic";

const router = express.Router();

router.post("/slug", getComicBySlug);
router.get("/category-one", findOneCategory);
router.post("/filter", getComicByFilter);
router.get("/category-client", getAllCategoryClient);
router.post("/comic-of-list-category", getComicsFromListCategory);
router.post("/list-highest-views-daily", top10ComicsDaily);
router.post("/list-highest-views-weekly", top10ComicsWeekly);
router.post("/list-highest-views-monthly", top10ComicsMonthly);
router.post("/update-chapter-view", updateChapterView);
router.post("/new-post", getTop24NewPost);
router.post("/all-slug", getAllSlug);
router.get("/total-page-from-limit", getTotalPageFromLimit);

module.exports = router;
