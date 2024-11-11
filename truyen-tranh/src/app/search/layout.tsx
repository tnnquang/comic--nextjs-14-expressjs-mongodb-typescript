import { Metadata } from "next";
import { Suspense } from "react";

import LoadingSearch from "./loading";
import { TITLE_CONFIG } from "@/configs/metadata-config";
import { BASE_URL_FRONTEND } from "@/common/constant";

type Props = {
  children: React.ReactNode;

};

export function generateMetadata(): Metadata {

  return {
    title: `Trang tìm kiếm | Truyện Tranh Full`,
    description: TITLE_CONFIG.home,
    metadataBase: new URL(BASE_URL_FRONTEND),
  };
}

export default function SearchLayout({ children }: Props) {

  return <Suspense fallback={<LoadingSearch />}>{children}</Suspense>;
}
