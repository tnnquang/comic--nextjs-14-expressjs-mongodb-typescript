import { FaCirclePlay } from "react-icons/fa6";

import {
  fetchAds,
  getDataFromSlugWithChapter,
} from "@/common/utils";
import NotFoundPage from "@/app/not-found";
import HandleReadComicComponent from "@/components/ComicComponents/HandleReadComicComponent";
import { Suspense } from "react";
import Spinner from "@/components/LoadingComponents/Spinner";
// import HandlePlayVideoComponent from "@/components/FilmComponents/HandlePlayVideoComponent";

type Props = {
  params: { slug: string[] };
};

export default async function ChapterSlugPage({ params }: Props) {
  const slug = params.slug;

  if (slug.length !== 2) {
    return <NotFoundPage />;
  }

  const fetchData = async (): Promise<any | null> => {
    const data = await getDataFromSlugWithChapter(slug[0], slug[1]);
    return data;
  };

  const [item, ads] = await Promise.all([fetchData(), fetchAds()]);

  if (!item)
    return (
      <div className="relative mb-2 flex h-[400px] w-full max-w-full animate-pulse items-center justify-center rounded-xl bg-brandLinear bg-opacity-20 xl:h-[500px] 2xl:h-[550px]">
        <FaCirclePlay size={44} />
      </div>
    );

  return (
    <Suspense
      fallback={
        <div className="w-full my-6 flex items-center justify-center">
          <Spinner />
        </div>
      }
    >
      <HandleReadComicComponent item={item} adsInPlayer={ads?.in_player} />
    </Suspense>
  );
}
