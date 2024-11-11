import { Metadata } from "next";
import { Suspense } from "react";
import { ErrorBoundary } from "next/dist/client/components/error-boundary";

import ErrorPhim from "./error";
import NotFoundComponent from "@/components/404";
import { BASE_URL_FRONTEND } from "@/common/constant";
import { TITLE_CONFIG } from "@/configs/metadata-config";
import Spinner from "@/components/LoadingComponents/Spinner";
import {
  PERSONAL_TYPE,
  TYPE_LIST_COMIC_SINGLE_OR_SERIES,
} from "@/configs/types";

type Props = {
  params: { id: string };
  children: React.ReactNode;
};

export function generateMetadata({ params }: Props): Metadata {
  const slug = params.id;
  const arrSlug = decodeURIComponent(slug).split("&");
  if (arrSlug.length > 1) {
    const type = arrSlug[1].split("=");
    if (type[1] === "author") {
      return {
        title: `Danh sách truyện của tác giả ${arrSlug[0]} | ${TITLE_CONFIG.title}`,
        description: TITLE_CONFIG.home,
      };
    }
  } else {
    if (TYPE_LIST_COMIC_SINGLE_OR_SERIES.includes(slug)) {
      return {
        title:
          slug === "truyen-moi"
            ? `${TITLE_CONFIG.truyenmoi} | ${TITLE_CONFIG.home}`
            : "Không tìm thấy trang yêu cầu",
        description: TITLE_CONFIG.home,
        metadataBase: new URL(BASE_URL_FRONTEND),
      };
    }
  }

  return {
    title: "Không tìm thấy",
    description: TITLE_CONFIG.home,
  };
}

export default function ListLayout({ children, params }: Props) {
  let checked = false;
  const slug = params.id;
  let type = null;
  const arrSlug = decodeURIComponent(slug).split("&");

  //slug = "aaaaa", ""
  if (arrSlug.length === 1) {
    checked = TYPE_LIST_COMIC_SINGLE_OR_SERIES.includes(slug);
  } else {
    type = arrSlug[1].split("=")[1];
    checked = PERSONAL_TYPE.includes(type.toLowerCase());
  }
  if (checked)
    return (
      <Suspense
        fallback={
          <div className="loading-list mx-auto flex h-screen w-screen items-center justify-center p-0">
            <Spinner />
          </div>
        }
      >
        <div className="w-full">
          <p className="mb-2 w-full text-xl font-bold">
            {type && PERSONAL_TYPE.includes(type.toLowerCase())
              ? `
            Danh sách truyện của tác giả             
          `
              : `Danh sách `}
            <span className="name-of rounded-xl bg-blueSecondary px-2 py-1 shadow-lg">
              {type && PERSONAL_TYPE.includes(type.toLowerCase())
                ? arrSlug[0]
                : slug === "truyen-moi"
                ? "Truyện mới cập nhật"
                : "Không có trang yêu cầu"}
            </span>
          </p>

          <ErrorBoundary errorComponent={ErrorPhim}>{children}</ErrorBoundary>
        </div>
      </Suspense>
    );
  return <NotFoundComponent />;
}
