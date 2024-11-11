"use client";

import { Input } from "antd";
import { isEmpty } from "lodash";
import { useSearchParams } from "next/navigation";
import { BsArrowLeft, BsArrowRight } from "react-icons/bs";
import { Suspense, useEffect, useMemo, useState } from "react";

import { scrollToTop } from "@/common/utils";
import axiosInstance from "@/common/axiosInstance";
import FiltersComponent from "@/components/FilterComponent";
import { GET_COMIC_BY_FILTER } from "@/common/constant";
import Spinner from "@/components/LoadingComponents/Spinner";
import ListComicItemComponent, {
  FilmSkeletonComponent,
} from "@/components/ComicComponents/ListFilmItem";

export default function SearchComponent({
  listDataFilters,
}: {
  listDataFilters: any;
}) {
  const searchParams = useSearchParams();
  const query = searchParams.get("query");
  const [filters, setFilters] = useState<any>(query ? { keyword: query } : {});

  const [dataFilm, setDataFilm] = useState<any>({
    result: null,
    totalPages: 0,
    currentPage: 1,
  });
  const [fetchingData, setFetchingData] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);

  const getDataFilm = async (filters: any) => {
    if (!filters) {
      setFetchingData(false);
      setDataFilm({ result: [] });
      return;
    }

    // console.log("ffff ", filters);
    setFetchingData(true);
    try {
      const ress = await axiosInstance.post(
        GET_COMIC_BY_FILTER,
        { filters: { ...filters } },
        {
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      if (ress.status === 200) {
        setFetchingData(false);
        setDataFilm(ress.data);
        setTotalPages(ress.data.totalPages);
      } else {
        setFetchingData(false);
        setDataFilm({ result: [] });
        setTotalPages(0);
      }
    } catch (error: any) {
      setFetchingData(false);
      setDataFilm({ result: [] });
      // toast.error(`Error fetching data: ${error?.message ?? error}`);
    }
  };

  const handleNextPage = () => {
    if (currentPage && currentPage < totalPages) {
      getDataFilm({ ...filters, page: currentPage + 1 });
      setCurrentPage((prev: any) => prev + 1);
      scrollToTop();
    }
  };
  const handlePrevPage = () => {
    if (currentPage && currentPage !== 1) {
      getDataFilm({ ...filters, page: currentPage - 1 });
      setCurrentPage((prev: any) => prev - 1);
      scrollToTop();
    }
  };

  useEffect(() => {
    if (!query) return;
    getDataFilm({ keyword: query });
  }, []);

  const BodyContent = useMemo(() => {
    return (
      <Suspense
        fallback={
          <div className="my-6 flex w-full items-center justify-center">
            <Spinner />
          </div>
        }
      >
        <div className="data-list-film mb-6 flex flex-wrap items-start gap-2">
          {fetchingData ? (
            <div className="mx-auto">
              <Spinner />
            </div>
          ) : (
            <Suspense fallback={<FilmSkeletonComponent />}>
              <ListComicItemComponent listFilm={dataFilm?.result} />
            </Suspense>
          )}
        </div>
        {!isEmpty(dataFilm?.result) && totalPages !== 0 && (
          <div className="pagination-container flex items-center justify-center gap-4">
            {currentPage > 1 && (
              <button
                onClick={handlePrevPage}
                className={`prev-page flex h-8 w-8 items-center justify-center rounded-md transition-all duration-200 hover:bg-white hover:text-blueSecondary`}
                disabled={currentPage === 1}
              >
                <BsArrowLeft size={20} />
              </button>
            )}
            <Input
              className="block !h-8 !w-8 !bg-blueSecondary text-center !text-white"
              value={currentPage}
              disabled
            />
            {currentPage < totalPages && (
              <button
                onClick={handleNextPage}
                className="next-page flex h-8 w-8 items-center justify-center rounded-md transition-all duration-200 hover:bg-white hover:text-blueSecondary"
                disabled={currentPage === totalPages}
              >
                <BsArrowRight size={20} />
              </button>
            )}
          </div>
        )}
      </Suspense>
    );
  }, [fetchingData, dataFilm?.result]);

  return (
    <section className="list-film-container w-full">
      <FiltersComponent
        filters={filters}
        setFilters={setFilters}
        fetching={fetchingData}
        onSubmit={getDataFilm}
        keyword={query as string}
        isSearching={true}
        listData={listDataFilters}
      />
      {BodyContent}
    </section>
  );
}
