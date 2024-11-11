export type TypeComicSlug =
  | "hoan-thanh"
  | "sap-ra-mat"
  | "dang-phat-hanh"
  | "truyen-moi";

export type TypeComicText = "Đã hoàn thành" | "Sắp ra mắt" | "Đang phát hành";

export type ObjectWithKey = { [key: string]: any };

/* Slug full response type */

export interface IComicSlugType {
  title: string;
  originTitle: string[];
  titleSEO: string;
  descriptionSEO: string;
  content: string;
  thumbnail: string;
  slug: string;
  author: string[];
  categories: string[];
  currentChapter: number;
  status: string;
  keywords: string[];
  notify: any[];
  chapter: IChapterSlug[];
  listChapters: IListChapter[];
}

export interface IChapterSlug {
  serverName: string;
  chapterData: IChapterData;
  nextChapter: string | null | undefined;
  previousChapter: string | null | undefined;
}

export interface IChapterData {
  views: number;
  chapterTitle: string;
  chapterName: string;
  slug: string;
  CDNPath: string;
  chapterImages: IChapterImage[];
  _id: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface IChapterImage {
  imageFile: string;
  imagePage: number;
}

export interface IListChapter {
  chapterName: string;
  slug: string;
  totalImages: number;
}
