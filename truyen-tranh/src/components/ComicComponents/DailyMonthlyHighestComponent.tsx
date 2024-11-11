"use client";

import { DAYMONTH_VIEW } from "@/common/enum";
import { toCapitalize } from "@/common/utils";

import Link from "next/link";
import { Suspense, useState } from "react";

function HighestViewComponent({ item, index }: { item: any; index: number }) {
  return (
    <Link
      href={`/detail/${item.slug}`}
      className={`w-full mt-1 shadow-md shadow-brand-900 first:mt-0 flex items-start gap-2 border-b border-dashed border-gray-500 border-opacity-50 p-2.5 hover:bg-blueSecondary hover:bg-opacity-40 rounded-lg transition-all duration-300`}
    >
      <span
        className={`p-2 rounded-full w-8 h-8 text-center text-base font-semibold flex items-center justify-center ${
          index == 1
            ? "bg-danger"
            : index == 2
            ? "bg-blue-600"
            : index === 3
            ? "bg-blueSecondary"
            : " border border-yellow-200"
        }`}
      >
        {index}
      </span>
      <div
        className=""
        style={{
          width: "calc(100% - 32px - 8px)",
        }}
      >
        <p className="title-comic font-semibold text-blue-500 line-clamp-2">
          {toCapitalize(item.title)}
        </p>
        <p className="list-cate line-clamp-2">
          {item.categories.map((el: string, indexing: number) => (
            <span
              className="text-xs italic text-yellow-50"
              key={indexing.toString() + "cate"}
            >
              {el}
              {indexing < item.categories.length - 1 && ", "}
            </span>
          ))}
        </p>
      </div>
    </Link>
  );
}

export function DailyHighestViewsComponent({
  listDaily,
}: {
  listDaily: any[] | null | undefined;
}) {
  if (!listDaily || listDaily?.length === 0) {
    return (
      <span className="py-4 px-2 line-clamp-2 text-white">
        Chưa có cập nhật danh sách đọc hôm nay
      </span>
    );
  }
  return listDaily.map((item: any, index: number) => (
    <HighestViewComponent
      item={item}
      index={index + 1}
      key={index.toString() + "daily"}
    />
  ));
}

export function WeekylyHighestViewsComponent({
  list,
}: {
  list: any[] | null | undefined;
}) {
  if (!list || list?.length === 0) {
    return (
      <span className="py-4 px-2 line-clamp-2 text-white">
        Chưa có cập nhật danh sách đọc 7 ngày qua
      </span>
    );
  }
  return list.map((item: any, index: number) => (
    <HighestViewComponent
      item={item}
      index={index + 1}
      key={index.toString() + "daily"}
    />
  ));
}

export function MonthlyHighestViewsComponent({
  listMonthly,
}: {
  listMonthly: any[] | null | undefined;
}) {
  if (!listMonthly || listMonthly?.length === 0) {
    return (
      <span className="py-4 px-2 line-clamp-2 text-white">
        Chưa có cập nhật danh sách đọc 30 ngày trước
      </span>
    );
  }

  return listMonthly.map((item: any, index: number) => (
    <HighestViewComponent
      item={item}
      index={index + 1}
      key={index.toString() + "monthly"}
    />
  ));
}

export default function DailyMonthlyHighestComponent({
  dataList,
}: {
  dataList: {
    listDaily: null | undefined | any[];
    listMonthly: null | undefined | any[];
    listWeekly: null | undefined | any[];
  };
}) {
  const [tabSelected, setTabSeleted] = useState(DAYMONTH_VIEW.MONTH);

  return (
    <Suspense>
      <div className="highest-container">
        <div className="tab-month-day mb-5 flex items-center gap-3">
          {Object.values(DAYMONTH_VIEW).map((el, index) => (
            <button
              className={`rounded-[30px] px-3 py-1 bg-opacity-80 transition-all duration-300 cursor-pointer ${
                el === tabSelected
                  ? "bg-blueSecondary text-white"
                  : "bg-white text-body"
              }`}
              name={el}
              key={index.toString() + el}
              onClick={() => setTabSeleted(el)}
            >
              {el}
            </button>
          ))}
        </div>
        {tabSelected === DAYMONTH_VIEW.TODAY ? (
          <DailyHighestViewsComponent listDaily={dataList.listDaily} />
        ) : tabSelected === DAYMONTH_VIEW.MONTH ? (
          <MonthlyHighestViewsComponent listMonthly={dataList.listMonthly} />
        ) : (
          <WeekylyHighestViewsComponent list={dataList.listWeekly} />
        )}
      </div>
    </Suspense>
  );
}
