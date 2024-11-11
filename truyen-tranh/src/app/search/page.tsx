import { Metadata } from "next";

import SearchComponent from "@/components/SearchComponent";
import {
  getListCategory,

} from "@/common/utils";

type Props = {
  searchParams: { [key: string]: string | string[] | null | undefined };
};

export function generateMetadata({ searchParams }: Props): Metadata {
  // read route params
  const query = searchParams.query;
  if (query) {
    return {
      title: `Results of search query: ${decodeURIComponent(query as string)} | NghienJAV`,
    };
  } else {
    return {
      title: `Result is empty | NghienJAV`,
    };
  }
}

export default async function SearchPage() {
  const [categories] = await Promise.all([
    getListCategory(),
  ]);
  return (
    <SearchComponent listDataFilters={{ categories}} />
  );
}
