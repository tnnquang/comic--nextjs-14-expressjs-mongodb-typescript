import { isEmpty } from "lodash";
import type { Metadata, ResolvingMetadata } from "next";
import {
  BASE_URL_API,
  BASE_URL_FRONTEND,
  GET_COMIC_FROM_SLUG,
  fetchOrigin,
} from "@/common/constant";
import { returnDefaultImageURL_v2 } from "@/common/utils";
import NotFoundComponent from "@/components/404";
import Spinner from "@/components/LoadingComponents/Spinner";
import { TITLE_CONFIG } from "@/configs/metadata-config";
import { ErrorBoundary } from "next/dist/client/components/error-boundary";
import { Suspense } from "react";
import MovieErrorBoundary from "./error";

type Props = {
  params: { slug: string };
  children: React.ReactNode;
};

export async function generateMetadata(
  { params }: Props,
  parent: ResolvingMetadata
): Promise<Metadata> {
  const slug = params.slug;

  const data = await fetch(`${BASE_URL_API}${GET_COMIC_FROM_SLUG}`, {
    method: "POST",
    headers: {
      Accept: "application.json",
      "Content-Type": "application/json",
      ...fetchOrigin,
    },
    body: JSON.stringify({
      slug: slug,
      type: "short",
    }),
  }).then((res) => res.json());

  const previousImages = (await parent).openGraph?.images || [];
  const thumb = returnDefaultImageURL_v2(data.item.thumbnail);
  return {
    title: data.item
      ? `Truyện Tranh: ${data.item.title} - ${data.item.status} | ${TITLE_CONFIG.home}`
      : "Không tìm thấy truyện" + `| ${TITLE_CONFIG.home}`,
    description: data.item
      ? data.item.descriptionSEO ?? data.item.titleSEO + " " + data.item.status
      : "",
    openGraph: data.item
      ? {
          images: [`${thumb}`, ...previousImages],
        }
      : undefined,
    metadataBase: new URL(BASE_URL_FRONTEND),
    keywords: `Đọc truyện tranh ${data.item.titleSEO} trực tuyến, xem truyện tranh full, Truyện full, cày truyện đêm, ${(data.item.keywords as string[]).join(",")}`,
  };
}

export default async function FilmLayout({ params, children }: Props) {
  const slug = params.slug;
  // fetch data

  const ress = await fetch(`${BASE_URL_API}${GET_COMIC_FROM_SLUG}`, {
    method: "POST",
    headers: {
      Accept: "application.json",
      "Content-Type": "application/json",
      ...fetchOrigin,
    },
    body: JSON.stringify({
      slug: slug,
      type: "short",
    }),
    // next: { revalidate: 900 },
  });

  if (ress.ok) {
    const data = await ress.json();
    if (isEmpty(data.item)) {
      return <NotFoundComponent />;
    } else
      return (
        <Suspense
          fallback={
            <div className="shadow-custom-1 flex h-[576px] w-full max-w-[755px] animate-pulse items-center justify-center rounded-lg bg-[#5142FC] bg-opacity-25">
              <Spinner />
            </div>
          }
        >
          <ErrorBoundary errorComponent={MovieErrorBoundary}>{children}</ErrorBoundary>
        </Suspense>
      );
  }
}
