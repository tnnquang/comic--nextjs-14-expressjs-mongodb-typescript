import React from "react";
import { isEmpty } from "lodash";

import ListComicItemComponent from "./ListFilmItem";
import {
  BASE_URL_API,
  GET_DATA_FROM_LIST_CATEGORY,
  fetchOrigin,
} from "@/common/constant";

export default async function ListComicsSameCategoryComponent({
  listCategory,
  title,
}: {
  listCategory: string[];
  title: string;
}) {
  //Nhan vao 1 mang the loai

  const res = await fetch(`${BASE_URL_API}${GET_DATA_FROM_LIST_CATEGORY}`, {
    method: "POST",
    headers: {
      Accept: "application.json",
      "Content-Type": "application/json",
      ...fetchOrigin,
    },
    body: JSON.stringify({ category: listCategory, title }),
  });
  if (res.ok) {
    const parserData = await res.json();
    const dataList = parserData.result;
    return (
      <section className="list-data-content border-t border-t-blueSecondary border-opacity-50 py-4">
        <p className="text-2xl font-bold uppercase text-white">Cùng thể loại</p>
        {dataList?.map((e: any) => (
          <div className="mt-6" key={e.slug}>
            <p className="title-head text-lg font-medium">{e.name}</p>
            {!isEmpty(e.result) && (
              <div className="relative mb-8 mt-4 flex flex-wrap items-start gap-2">
                <ListComicItemComponent listFilm={e.result} />
              </div>
            )}
          </div>
        ))}
      </section>
    );
  }
  return null;
}
