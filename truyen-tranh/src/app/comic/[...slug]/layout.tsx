import { isEmpty } from "lodash";
import { Metadata, ResolvingMetadata } from "next";

import {
  getDataFromSlugWithChapter,
  returnDefaultImageURL_v2,
  toCapitalize,
} from "@/common/utils";
import NotFoundComponent from "@/components/404";
import {
  BASE_URL_API,
  BASE_URL_FRONTEND,
  GET_COMIC_FROM_SLUG,
  IMAGE_BASE_URL,
  fetchOrigin,
} from "@/common/constant";
import { TITLE_CONFIG } from "@/configs/metadata-config";
import ListComicsSameCategoryComponent from "@/components/ComicComponents/ListComicsSameCategoryComponent";
import Link from "next/link";

type Props = {
  params: { slug: string[] };
  // searchParams: { [key: string]: string | string[] | undefined };
  children: React.ReactNode;
};

export async function generateMetadata(
  { params }: Props,
  parent: ResolvingMetadata
): Promise<Metadata> {
  // read route params
  const slug = params.slug;
  if (slug.length !== 2) {
    return {
      title: "Đường dẫn không đúng",
      description: TITLE_CONFIG.home,
    };
  }
  // fetch data
  const product = await getDataFromSlugWithChapter(slug[0], slug[1], true);

  // optionally access and extend (rather than replace) parent metadata
  const previousImages = (await parent).openGraph?.images || [];
  const thumb = returnDefaultImageURL_v2(product.thumbnail);
  return {
    title: product
      ? `Đọc truyện tranh: ${toCapitalize(
          product.titleSEO
        )} - ${product.chap} Chất lượng cao | Xem truyên ${toCapitalize(product.title)} ${
          product.status
        } | ${TITLE_CONFIG.home}`
      : "Không tìm thấy truyện",
    description: product
      ? product.descriptionSEO ?? product.title
      : "",
    openGraph: product
      ? {
          images: [thumb, ...previousImages],
        }
      : undefined,
    metadataBase: new URL(BASE_URL_FRONTEND),
    keywords: product.keywords,
  };
}

export default function WatchFilmLayout({ children, params }: Props) {
  return children;
  const slug = params.slug;

  // fetch data
  const fetchData = () => {
    return fetch(`${BASE_URL_API}${GET_COMIC_FROM_SLUG}`, {
      method: "POST",
      headers: {
        Accept: "application.json",
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        slug: slug,
        type: "short",
      }),
      next: { revalidate: 900, tags: ["watch-film"] },
    })
      .then((res) => res.json())
      .then((product) => {
        if (isEmpty(product)) {
          return Promise.reject("Not Found");
        }
        return Promise.resolve(product);
      })
      .catch(() => Promise.resolve({ item: null }));
  };

  return fetchData().then((product) => {
    if (isEmpty(product)) {
      return <NotFoundComponent />;
    }
    return (
      <div className="watch-main-page w-full">
        {children}
        <div className="list-film-container w-full">
          <ListComicsSameCategoryComponent
            listCategory={product?.categories}
            title={product.title}
          />
        </div>
        <div className="keywords">
          <span className="text-keywords text-base font-bold underline">
            Keywords:{" "}
          </span>
          {product.keywords.map((el: string, index: number) => (
            <Link
              href={`/search?query=${el}`}
              key={el + index + "yui"}
              target="_blank"
              className="text-sm text-opacity-70 hover:text-red-500 hover:text-opacity-60"
            >
              {el}
              {index < product.keywords.length - 1 ? ", " : "."}
            </Link>
          ))}
        </div>
      </div>
    );
  });
}
