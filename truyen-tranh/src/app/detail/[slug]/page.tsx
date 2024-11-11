import React from "react";
import Link from "next/link";
import Image from "next/image";
import { isEmpty } from "lodash";
import { FaPlay, FaUser } from "react-icons/fa";

import { returnDefaultImageURL_v2 } from "@/common/utils";
import ListComicsSameCategoryComponent from "@/components/ComicComponents/ListComicsSameCategoryComponent";
import {
  BASE_URL_API,
  GET_COMIC_FROM_SLUG,
  GET_ONE_CATEGORY,
  GET_ONE_COUNTRY,
  fetchOrigin,
  isBrowser,
} from "@/common/constant";

export default async function ComicDetail({ params }: { params: any }) {
  const slug = params.slug;

  const dataSlug = await fetch(`${BASE_URL_API}${GET_COMIC_FROM_SLUG}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...fetchOrigin,
    },
    body: JSON.stringify({
      slug: slug,
      type: "short",
    }),
    next: { revalidate: 1800 },
  });
  if (dataSlug.ok) {
    const data = await dataSlug.json();
    const item = data.item;

    //Get image
    const image = returnDefaultImageURL_v2(item.thumbnail);
    // console.log("itemeeee", item)
    const promiseCategories = item.categories.map(async (e: string) => {
      const cate = await fetch(`${BASE_URL_API}${GET_ONE_CATEGORY}?slug=${e}`, {
        headers: {
          ...fetchOrigin,
        },
      }).then((value) => value.json());
      return cate;
    });
    const categories = await Promise.all(promiseCategories);
    // console.log(categories)
    const categorySlug = (cateName: string) =>
      categories.find((e) => e?.result?.name === cateName)?.result?.slug;

    return (
      <section className="film-container mx-auto mt-6 max-w-[1800px] items-start ">
        <div className="wrapper-content wrapper-film flex flex-col items-start gap-4 md:flex-row 2lg:flex-col xl:flex-row">
          <div className="left-content mx-auto w-full md:w-[280px]">
            <div className="film-thumbnail relative mx-auto mb-2 sm:min-w-[230px] md:w-[280px] h-[300px] sm:h-[360px] w-full overflow-hidden rounded-lg shadow-md shadow-horizonPurple-400 ">
              <Image
                src={image}
                fill
                alt={item?.title}
                placeholder="blur"
                blurDataURL="/blur_img.webp"
                className="rounded-lg"
                sizes="100vw"
                loading="lazy"
                quality={60}
              />
            </div>
            {/* {item.quality === "Trailer" ? (
              !isEmpty(item.trailer_url) ? (
                <Link
                  className={`watch-film mx-auto mt-2 flex items-center justify-center gap-2 rounded-lg bg-danger px-3 py-2 transition-all duration-200 hover:opacity-80 `}
                  type="button"
                  role="button"
                  tabIndex={1}
                  href={`/comic/${item?.slug}`}
                  prefetch={false}
                >
                  <FaPlay /> Watch Trailer
                </Link>
              ) : (
                <span
                  className={`watch-film mx-auto mt-2 flex cursor-not-allowed items-center justify-center gap-2 rounded-lg bg-danger px-3 py-2 opacity-25 transition-all duration-200`}
                >
                  <FaPlay /> Xem Truyện
                </span>
              )
            ) : (
              <Link
                className={`watch-film mx-auto flex items-center justify-center gap-2 rounded-lg bg-danger px-3 py-2 transition-all duration-200 hover:opacity-80`}
                type="button"
                role="button"
                tabIndex={1}
                href={`/comic/${item?.slug}`}
                prefetch={false}
              >
                <FaPlay /> Xem Truyện
              </Link>
            )} */}
          </div>
          <div className="right-content w-full">
            <div className="group-title mb-6">
              <p className="title-text text-xl font-semibold text-white">
                {item?.title}
              </p>
              {item?.originTitle && item.originTitle?.length > 0 && (
                <div className="mt-2 text-sm italic">
                  {item?.originTitle?.map((name: string, index: number) => (
                    <span className="" key={index.toString() + "span"}>
                      {name}
                      {index > 0 && index < item.originTitle.length - 1 && ","}
                    </span>
                  ))}
                </div>
              )}
            </div>
            <div className="content-info w-full max-w-full rounded-lg p-4 shadow-[#14141F]">
              {item?.duration && (
                <p className="duration flex items-center gap-4 py-2 text-sm">
                  <span className="duration-text  w-[120px] font-semibold opacity-70">
                    Duration
                  </span>
                  <span className="text detail-text">{item?.duration}</span>
                </p>
              )}
              {!isEmpty(item?.author) && !isEmpty(item?.author[0]) && (
                <p className="duration flex items-start gap-4 py-2 text-sm">
                  <span className="duration-text w-[120px] font-semibold opacity-70">
                    Tác giả
                  </span>
                  <span className="text detail-text">
                    {item?.director?.map((e: string, index: number) => (
                      <React.Fragment key={e + "dd"}>
                        {index > 0 && ", "}
                        <Link
                          href={`/list/${e}&type=director`}
                          target="_blank"
                          prefetch={false}
                          className="transition-all duration-200 hover:opacity-55"
                        >
                          {e}
                        </Link>
                      </React.Fragment>
                    ))}
                  </span>
                </p>
              )}
              <p className="total-ep flex items-center gap-4 py-2 text-sm">
                <span className="duration-text w-[120px] font-semibold opacity-70">
                  Chương hiện tại
                </span>
                <span className="text detail-text">{item.currentChapter}</span>
              </p>

              <p className="duration flex items-start gap-4 py-2 text-sm">
                <span className="duration-text w-[120px] font-semibold opacity-70">
                  Thể loại
                </span>
                <span className="text detail-text">
                  {item?.categories &&
                    typeof item?.categories[0] !== "object" &&
                    item?.categories?.map((e: string, index: number) => (
                      <Link
                        href={`/category/${categorySlug(e)}`}
                        key={e + index.toString()}
                        target="_blank"
                        prefetch={false}
                        className="transition-all duration-200 hover:opacity-55"
                      >
                        {index > 0 && ", "} {e}
                      </Link>
                    ))}
                </span>
              </p>
              {item.quality && (
                <p className="duration flex items-center gap-4 py-2 text-sm">
                  <span className="duration-text  w-[120px] font-semibold opacity-70">
                    Chất lượng
                  </span>
                  <span className="text detail-text">{item?.quality}</span>
                </p>
              )}

              {!isEmpty(item?.language) && (
                <p className="duration flex items-center gap-4 py-2 text-sm">
                  <span className="duration-text  w-[120px] font-semibold opacity-70">
                    Ngôn ngữ
                  </span>
                  <span className="text detail-text">{item?.language}</span>
                </p>
              )}
              <p className="duration flex items-center gap-4 py-2 text-sm">
                <span className="duration-text  w-[120px] font-semibold opacity-70">
                  Năm phát hành
                </span>
                <span className="text detail-text">{item?.year_release}</span>
              </p>

              <p className="duration flex items-center gap-4 py-2 text-sm">
                <span className="duration-text  w-[120px] font-semibold opacity-70">
                  Trạng thái
                </span>
                <span className="text detail-text">{item?.status}</span>
              </p>
            </div>
          </div>
        </div>

        <div className="description my-4 p-2">
          <p className="mb-3 text-center text-base font-semibold uppercase">
            Giới thiệu truyện
          </p>
          <p className="main-description text-sm opacity-80">
            <span dangerouslySetInnerHTML={{ __html: item?.content }}></span>
          </p>
        </div>
        <section className="list-chapters pb-6">
          <h3 className="font-bold text-center text-xl uppercase pb-3">
            Danh sách các chương
          </h3>
          <ul className="w-full list-chapters grid grid-cols-1 sm:grid-cols-2 gap-2 md:grid-cols-3 xl:grid-cols-4 p-3 max-h-[400px] overflow-y-auto">
            {!isEmpty(item.listChapters) &&
              item.listChapters.map((chap: any, index: number) => (
                <li
                  className="chapter-item line-clamp-1 text-sm font-semibold text-left hover:text-blue-500 hover:bg-gray-200 hover:bg-opacity-20 rounded-md duration-200 transition-all"
                  key={index.toString() + "opp"}
                >
                  <Link
                    href={`/comic/${item.slug}/${chap.slug}`}
                    className="inline-block w-full p-2 line-clamp-1"
                  >
                    {chap.chapterName}
                    {!isEmpty(chap.chapterTitle)
                      ? `: ${chap.chapterTitle}`
                      : null}
                  </Link>
                </li>
              ))}
          </ul>
        </section>
        <ListComicsSameCategoryComponent
          listCategory={item?.categories}
          title={item?.title}
        />
        <div className="keywords">
          <span className="text-keywords text-base font-bold underline pb-4">
            Từ khoá:{" "}
          </span>
          <div className="w-full max-h-[400px] overflow-y-auto">
            {item.keywords?.length > 0 &&
              item?.keywords?.map((el: string, index: number) => (
                <Link
                  href={`/search?query=${el}`}
                  key={el + index.toString() + "kk"}
                  target="_blank"
                  className="text-sm text-opacity-70 hover:text-red-500 hover:text-opacity-60"
                >
                  {el}
                  {index < item.keywords.length - 1 ? ", " : "."}
                </Link>
              ))}
          </div>
        </div>
      </section>
    );
  }

  return null;
}
