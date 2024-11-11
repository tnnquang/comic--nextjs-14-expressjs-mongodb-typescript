import {
  BASE_URL_API,
  BASE_URL_FRONTEND,
  GET_ONE_CATEGORY,
  fetchOrigin,
} from "@/common/constant";
import NotFoundComponent from "@/components/404";
import Spinner from "@/components/LoadingComponents/Spinner";
import { TITLE_CONFIG } from "@/configs/metadata-config";
import { Metadata } from "next";
import { Suspense } from "react";

type Props = {
  params: { slug: string };
  children: React.ReactNode;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const slug = params.slug;
  const res = await fetch(`${BASE_URL_API}${GET_ONE_CATEGORY}?slug=${slug}`, {
    method: "GET",
    headers: {
      "Content-Type": "text/plain",
      ...fetchOrigin,
    },
  });
  if (res.ok) {
    const item = await res.json();
    return {
      title: `Danh sách truyện tranh của thể loại ${item?.result?.name} | ${TITLE_CONFIG.title}`,
      description: TITLE_CONFIG.home,
      metadataBase: new URL(BASE_URL_FRONTEND),
    };
  }

  return {
    title: "Not found",
    description: TITLE_CONFIG.home,
  };
}

export default async function ListLayout({ children, params }: Props) {
  const slug = params.slug;
  const ress = await fetch(`${BASE_URL_API}${GET_ONE_CATEGORY}?slug=${slug}`, {
    method: "GET",
    headers: {
      "Content-Type": "text/plain",
      ...fetchOrigin,
    },
  });
  if (ress.ok) {
    const data = await ress.json();
    if (data.result)
      return (
        <Suspense
          fallback={
            <div className="flex h-full w-full items-center justify-center">
              <Spinner />
            </div>
          }
        >
          <div className="h-full w-full">
            <p className="mb-2 mt-4 w-full text-xl font-bold">
              Danh sách truyện theo thể loại{" "}
              <span className="name-of rounded-xl bg-blueSecondary px-2 py-1 shadow-lg">
                {data.result.name}
              </span>
            </p>
            {children}
          </div>
        </Suspense>
      );
    return <NotFoundComponent />;
  } else throw new Error(`Error: ${ress.statusText}`);
}
