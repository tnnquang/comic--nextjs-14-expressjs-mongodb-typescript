import Link from "next/link";
import Image from "next/image";

import { IFilm } from "@/configs/types";
import {
  formatNumber,
  getFullDate,
  returnDefaultImageURL_v2,
} from "@/common/utils";

interface CustomFilm extends IFilm {
  current_episode: number | string;
}

export function FilmSkeletonComponent() {
  return (
    <div className="data-list-film flex w-full flex-wrap items-start gap-2">
      {[1, 2, 3, 4, 5, 6, 7, 8].map((e) => (
        <div
          className="film-item item-film-skeleton animate-pulse bg-brandLinear"
          key={`a${e}`}
        />
      ))}
    </div>
  );
}

export default function ListComicItemComponent({
  listFilm,
}: {
  listFilm: any[];
}) {
  if (listFilm === null) {
    return [1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((e) => (
      <div
        className="film-item item-film-skeleton animate-pulse bg-brandLinear"
        key={`a${e}`}
      />
    ));
  }
  if (listFilm?.length === 0) {
    return (
      <div className="w-full pt-5 text-center text-xl font-bold">
        Data is Empty!
      </div>
    );
  }

  return listFilm?.map((e: CustomFilm) => {
    const imgSrc = returnDefaultImageURL_v2(e.thumbnail);
    return (
      <Link
        className="film-item relative overflow-hidden p-2 border border-red-50"
        key={e._id}
        href={`/detail/${e.slug}`}
        prefetch={false}
      >
        <div className="w-full p-1 text-xs flex items-center justify-between gap-2 absolute top-0 left-0 bg-blueSecondary bg-opacity-30">
          <span className=" line-clamp-1">
            {e.createdAt
              ? getFullDate(new Date(e.createdAt).getTime()).fullDMY
              : null}
          </span>
          <span className="line-clamp-1">
            {formatNumber(e.views) + " views" || null}
          </span>
        </div>
        <Image
          src={imgSrc}
          fill
          alt={e.code ?? e.title ?? ""}
          loading="lazy"
          placeholder="blur"
          blurDataURL={"/bg-match-item.png"}
          className="object-cover transition-all duration-300 hover:scale-105"
          sizes="100vw"
          quality={40}
        />
        <p className="watch-full-text absolute bottom-0 left-0 text-xl font-bold text-danger">
          Đọc thôi
        </p>
        <div className="title-film absolute bottom-0 left-0 z-50 w-full text-center text-sm ">
          <p className="title line-clamp-2">{e.title}</p>
        </div>
      </Link>
    );
  });
}
