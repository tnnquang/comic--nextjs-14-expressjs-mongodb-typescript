import Link from "next/link";
import { FaCaretRight } from "react-icons/fa6";

import ListComicItemComponent from "./ListFilmItem";
import {
  fetchDataListFromAnyCategory,
} from "@/common/utils";

export default async function ListShowListItemWithAnyCategoryComponent({
  title,
  categorySlug,
  categoryName,
  isNewPost,
}: {
  title?: string;
  categorySlug?: string;
  categoryName?: string | string[];
  isNewPost?: boolean;
}) {
  if (title && !categoryName) return null;
  const data = await fetchDataListFromAnyCategory(
    categoryName as string | string[],
    isNewPost
  );

  return (
    <div className=" list-cartoon-container">
      <div className="flex items-center justify-between gap-2 rounded-lg bg-blueSecondary bg-opacity-30 p-2">
        <Link
          className="big-title uppercase inline-block w-fit border-b-2 border-b-[#5142fc7f] text-base font-semibold text-white sm:text-xl"
          prefetch={false}
          href={`/category/${categorySlug}`}
          target="_blank"
        >
          {title}
        </Link>
        <Link
          className="flex items-center gap-1 rounded-sm bg-white px-1 py-0.5 text-xs font-semibold text-blueSecondary transition-all duration-300 hover:bg-opacity-60"
          prefetch={false}
          href={`/category/${categorySlug}`}
          target="_blank"
        >
          Xem tất cả
          <FaCaretRight size={14} />
        </Link>
      </div>
      <div className="list-film-container mb-3 mt-2 flex w-full flex-wrap items-start gap-2 lg:mb-10 lg:mt-6">
        <ListComicItemComponent listFilm={data.result} />
      </div>
    </div>
  );
}
