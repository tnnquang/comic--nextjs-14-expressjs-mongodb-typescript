"use client";

import { isEmpty } from "lodash";
import { PaginationProps, Pagination, Input } from "antd";
import React, { Suspense, useEffect, useMemo, useState } from "react";

import FiltersComponent from "../FilterComponent";
import { ListData } from "@/configs/types";
import { scrollToTop } from "@/common/utils";
import axiosInstance from "@/common/axiosInstance";
import {
  GET_COMIC_BY_FILTER,
  DEFAULT_ITEMS,
  GET_NEW_COMIC,
} from "@/common/constant";
import ListComicItemComponent, { FilmSkeletonComponent } from "./ListFilmItem";
import { TYPE_OF_LIST } from "@/common/enum";
import { BsArrowLeft, BsArrowRight } from "react-icons/bs";

export default function FilmsByListComponent({
  id,
  listDataFilters,
}: {
  id: string;
  listDataFilters: ListData;
}) {
  //params = phim-le, phim-bo, dien vien, dao dien (dua theo type di kem)
  const [filters, setFilters] = useState<any>({}); //Phim lẻ
  const [dataFilm, setDataFilm] = useState<any>({
    result: null,
    totalPages: 0,
    currentPage: 1,
  });
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [fetchingData, setFetchingData] = useState(false);

  const getDataFilm = async (filters: any, page: number, limit?: number) => {
    if (!filters) {
      setFetchingData(false);
      setDataFilm({ result: [] });
      return;
    }
    let input: any;
    setFetchingData(true);
    if (filters.type === "truyen-moi") {
      input = { path: GET_NEW_COMIC };
    } else if (filters.type === "fc2") {
      const { type, ...rest } = filters;
      const newFilters = { ...rest, tag: TYPE_OF_LIST._FC2 };
      input = {
        path: GET_COMIC_BY_FILTER,
        data: {
          filters: { ...newFilters },
          page,
          limit: limit || DEFAULT_ITEMS,
        },
        headers: {
          headers: {
            "Content-Type": "application/json",
          },
        },
      };
    } else if (filters.type === "uncensored-leaked") {
      const { type, ...rest } = filters;
      const newFilters = { ...rest, type: TYPE_OF_LIST._UNCENSORED_LEAKED };
      input = {
        path: GET_COMIC_BY_FILTER,
        data: {
          filters: { ...newFilters },
          page,
          limit: limit || DEFAULT_ITEMS,
        },
        headers: {
          headers: {
            "Content-Type": "application/json",
          },
        },
      };
    } else {
      input = {
        path: GET_COMIC_BY_FILTER,
        data: { filters: { ...filters }, page, limit: limit || DEFAULT_ITEMS },
        headers: {
          headers: {
            "Content-Type": "application/json",
          },
        },
      };
    }
    try {
      const ress = await axiosInstance.post(
        input.path,
        input.data,
        input.headers
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
    } catch (error) {
      setFetchingData(false);
      setDataFilm({ result: [] });
      setTotalPages(0);
      console.error("Error fetching data:", error);
    }
  };

  useEffect(() => {
    if (!id) return;

    const arrSlug = decodeURIComponent(id).split("&");
    if (arrSlug.length === 2) {
      const type = arrSlug[1].split("=")[1];
      const newData = { ...filters };
      newData[type] = arrSlug[0];
      // console.log("hehehee >>>>", newData);
      setFilters(newData);
      getDataFilm({ [type]: arrSlug[0] }, currentPage);
    } else {
      const newData = { ...filters };
      newData.type = id;
      setFilters(newData);
      getDataFilm({ type: id }, currentPage);
    }
  }, [id]);

  useEffect(() => {
    if (!currentPage || currentPage == 0 || currentPage > totalPages) return;
    if (!id) return;
    setDataFilm({ result: null });
    getDataFilm(filters, currentPage);
    scrollToTop();
  }, [currentPage]);

  // const onChangePage: PaginationProps["onChange"] = (page) => {
  //   setCurrentPage(page);
  // };

  const handleNextPage = () => {
    if (currentPage && currentPage < totalPages) {
      setCurrentPage((prev: any) => prev + 1);
      scrollToTop();
    }
  };
  const handlePrevPage = () => {
    if (currentPage && currentPage !== 1) {
      setCurrentPage((prev: any) => prev - 1);
      scrollToTop();
    }
  };

  const BodyContent = useMemo(() => {
    return (
      <>
        <div className="data-list-film flex flex-wrap items-start gap-2">
          <Suspense fallback={<FilmSkeletonComponent />}>
            <ListComicItemComponent listFilm={dataFilm?.result} />
          </Suspense>
        </div>
        {!isEmpty(dataFilm?.result) && (
          <div className="group-btn-action-page mx-auto mb-6 mt-8 w-full">
            <div className="pagination mx-auto flex items-center justify-center gap-4 w-full">
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
              {/* <Pagination
                current={currentPage}
                onChange={onChangePage}
                total={DEFAULT_ITEMS * totalPages}
                defaultPageSize={DEFAULT_ITEMS}
                showSizeChanger={false}
                className="flex justify-center"
              /> */}
            </div>
          </div>
        )}
      </>
    );
  }, [dataFilm?.result]);

  return (
    <section className="list-film-container w-full">
      <FiltersComponent
        filters={filters}
        setFilters={setFilters}
        fetching={fetchingData}
        // setFetching={setFetchingData}
        onSubmit={getDataFilm}
        listData={listDataFilters}
      />
      {BodyContent}
    </section>
  );
}
