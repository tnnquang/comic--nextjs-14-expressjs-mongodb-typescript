"use client";

import { Tabs } from "antd";
import { isEmpty } from "lodash";

import React, { Suspense, useEffect, useRef, useState } from "react";
import { FaFacebook, FaOdnoklassniki, FaTwitter, FaVk } from "react-icons/fa6";
import {
  FacebookShareButton,
  OKShareButton,
  TwitterShareButton,
  VKShareButton,
} from "react-share";

import {
  getDataFromSlugWithChapter,
  getElement,
  scrollToTop,
} from "@/common/utils";
import { IComicSlugType } from "@/types";
import { toast } from "react-toastify";
import { IoChevronBack, IoChevronForward } from "react-icons/io5";

import OneSelectItem from "../SelectComponents/Select";
import { isBrowser, UPDATE_VIEW } from "@/common/constant";
import Image from "next/image";
import Spinner from "../LoadingComponents/Spinner";
import { useRouter } from "next/navigation";
import axiosInstance from "@/common/axiosInstance";

export default function HandleReadComicComponent({
  item,
  adsInPlayer,
}: {
  item: IComicSlugType | null | undefined;
  adsInPlayer?: any;
}) {
  const [isLoading, setLoading] = useState(false);
  const router = useRouter();
  const comicData = useRef<IComicSlugType | null | undefined>(item);
  const [chapter, setChapter] = useState<any | null | undefined>({
    ...(item?.listChapters.find(
      (e) => e.slug === item.chapter[0].chapterData.slug
    ) || null),
    init: true,
  });
  // const [chapter, setChapter] = useState<any>(null);

  const fetchDataChapter = async () => {
    try {
      scrollToTop(50);
      setLoading(true);
      const data = await getDataFromSlugWithChapter(
        comicData?.current?.slug,
        chapter.slug
      );
      setLoading(false);
      if (!data) {
        toast.error(`Dữ liệu của chương không có`);
        comicData.current = undefined;
      }

      comicData.current = data;
    } catch (error) {
      setLoading(false);
      toast.error(`Lấy dữ liệu của chương bị lỗi`);
      comicData.current = undefined;
    }
  };

  useEffect(() => {
    if (!chapter?.slug) return;
    if (chapter?.init === true) return;
    fetchDataChapter();
    router.push(`/comic/${comicData.current?.slug}/${chapter.slug}`);
  }, [chapter]);

  useEffect(() => {
    if (!comicData.current) return;
    if (!chapter) return;
    if (!chapter?.slug) return;
    const timeUpdateView = process.env.NEXT_PUBLIC_TIME_UPDATE_VIEW
      ? +process.env.NEXT_PUBLIC_TIME_UPDATE_VIEW
      : 10000;
    async function updateChapterView() {
      await axiosInstance
        .post(UPDATE_VIEW, {
          comicSlug: comicData.current?.slug,
          chapterSlug: chapter.slug,
        })
        .then((response) => response.data)
        .then((value) => value.result);
    }
    const timeOut = setTimeout(updateChapterView, timeUpdateView);
    return () => clearTimeout(timeOut);
  }, [comicData.current, chapter]);

  // const turnOffLightHandle = () => {
  //   const el = getElement("#light-out") as HTMLDivElement;
  //   const watchFilmEl = getElement(".watch-film-container") as HTMLElement;
  //   el.classList.toggle("active");
  //   watchFilmEl.classList.toggle("active");
  //   getElement(".main-container")?.classList.toggle("active");
  //   getElement("#header-container")?.classList.toggle("hidden");
  //   getElement(".row1-bn")?.classList.toggle("hidden");
  //   scrollToTop(10);
  // };

  const checkScrollWithinDiv = () => {
    if (isBrowser) {
      const handleScroll = () => {
        const element = getElement(".auxiliary-bottom");
        const dataContainer = getElement(
          ".comic-data-chapter"
        ) as HTMLDivElement; // Thay thế bằng ID của thẻ div chứa dữ liệu

        if (!element || !dataContainer) return;

        const containerHeight = dataContainer.offsetHeight;
        const scrollY = window.scrollY;

        // Kiểm tra nếu người dùng cuộn vượt quá chiều cao của thẻ div chứa dữ liệu
        if (scrollY >= containerHeight) {
          element.classList.add("hidden");
        } else if (scrollY < 150) {
          element.classList.add("hidden");
        } else {
          element.classList.remove("hidden");
        }
      };

      window.addEventListener("scroll", handleScroll);

      // Cleanup function to remove the event listener when the component unmounts
      return () => {
        window.removeEventListener("scroll", handleScroll);
      };
    }
  };

  useEffect(() => {
    const cleanup = checkScrollWithinDiv();
    return cleanup;
  }, []);

  const chapterOnchange = (value: string) => {
    const tmp = comicData.current?.listChapters.find((e) => e.slug === value);
    setChapter({ ...tmp, init: false });
  };

  const AuxiliaryComponent = ({ isBottom = false }: { isBottom?: boolean }) => {
    return (
      <div
        className={`w-full ${
          isBottom
            ? "fixed auxiliary-wrapper z-20 auxiliary-bottom hidden left-1/2 -translate-x-1/2 px-4 py-3 bg-body backdrop:blur-xl bottom-20"
            : ""
        }`}
      >
        {!isBottom && (
          <div className="share flex items-center gap-2 mb-2">
            <span className="share-text">Chia sẻ: </span>
            {isBrowser && (
              <div className="group-btn-share flex items-center gap-2">
                <FacebookShareButton
                  url={document.URL}
                  className="flex h-[30px] w-[30px] items-center justify-center rounded-full !bg-[#5142FC] transition-all duration-300 hover:!bg-white hover:!text-[#5142FC]"
                >
                  <FaFacebook size={20} />
                </FacebookShareButton>
                <TwitterShareButton
                  url={document.URL}
                  className="flex h-[30px] w-[30px] items-center justify-center rounded-full !bg-[#5142FC] transition-all duration-300 hover:!bg-white hover:!text-[#5142FC]"
                >
                  <FaTwitter size={20} />
                </TwitterShareButton>
                <VKShareButton
                  url={document.URL}
                  className="flex h-[30px] w-[30px] items-center justify-center rounded-full !bg-[#5142FC] transition-all duration-300 hover:!bg-white hover:!text-[#5142FC]"
                >
                  <FaVk size={20} />
                </VKShareButton>
                <OKShareButton
                  url={document.URL}
                  className="flex h-[30px] w-[30px] items-center justify-center rounded-full !bg-[#5142FC] transition-all duration-300 hover:!bg-white hover:!text-[#5142FC]"
                >
                  <FaOdnoklassniki size={20} />
                </OKShareButton>
              </div>
            )}
          </div>
        )}
        <p className="text-base text-white line-clamp-2 mb-2">
          Đang đọc truyện: <strong>{comicData.current?.title}</strong>
        </p>
        <div className={`flex items-center gap-1 justify-center w-full `}>
          <button
            className={`prev-btn p-2 2lg:p-3 flex rounded-md bg-danger ${
              comicData.current?.chapter[0].previousChapter
                ? " cursor-pointer hover:opacity-80 focus:outline-white"
                : "opacity-60"
            }`}
            onClick={() =>
              setChapter({
                ...comicData.current?.listChapters.find(
                  (e) =>
                    e.slug === comicData.current?.chapter[0].previousChapter
                ),
                init: false,
              })
            }
            disabled={!comicData.current?.chapter[0].previousChapter}
          >
            <IoChevronBack />
          </button>
          {/* <button
          onClick={turnOffLightHandle}
          className="btn-light-out w-max flex items-center gap-1 rounded-md bg-blueSecondary p-1 text-center text-xs text-white"
        >
          <MdLightMode /> <span className="text-light-out"></span>
        </button> */}
          <OneSelectItem
            className="w-full text-center text-base font-semibold line-clamp-1"
            options={
              comicData.current?.listChapters.map((el) => ({
                label: el.chapterName,
                value: el.slug,
                disabled: chapter.slug === el.slug,
              })) as any
            }
            selected={{ value: chapter?.slug, label: chapter.chapterName }}
            // placeholder={
            //   comicData.current?.listChapters.find(
            //     (e) => e.slug === chapterSlug
            //   )?.chapterName || "----Chọn chương-----"
            // }
            placeholder={"----Chọn chương-----"}
            handleChange={chapterOnchange}
            clear={false}
          />
          <button
            className={`next-btn p-2 2lg:p-3 flex rounded-md bg-danger ${
              comicData.current?.chapter[0].nextChapter
                ? " cursor-pointer"
                : "opacity-60"
            }`}
            onClick={() =>
              setChapter({
                ...comicData.current?.listChapters.find(
                  (e) => e.slug === comicData.current?.chapter[0].nextChapter
                ),
                init: false,
              })
            }
            disabled={!comicData.current?.chapter[0].nextChapter}
          >
            <IoChevronForward />
          </button>
          <button
            className={`rounded bg-white text-body inline-block w-max p-2 2lg:p-3 cursor-pointer hover:opacity-70`}
            onClick={() => {
              scrollToTop();
            }}
            // disabled={isBrowser && window.scrollY < 150}
          >
            <IoChevronBack className=" rotate-90" size={20} />
          </button>
        </div>
      </div>
    );
  };

  const RenderImageItem = ({ imageLink }: { imageLink: string }) => {
    return (
      <Image
        src={imageLink}
        alt=""
        width={0}
        height={0}
        sizes="100vw"
        loading="lazy"
        className="my-1 rounded-md max-w-[800px] mx-auto"
        placeholder="blur"
        blurDataURL="/bg-match-item.png"
        style={{ width: "100%", height: "auto" }} // optional
      />
    );
  };

  return (
    <React.Fragment>
      <section className="watch-film-container w-full">
        <AuxiliaryComponent />
        <div className={`w-full mt-4 comic-data-chapter`}>
          {isLoading || comicData.current == null ? (
            <div className="w-full mt-6 flex items-center justify-center">
              <Spinner />
            </div>
          ) : comicData.current === undefined ? (
            <p className="text-white text-center font-semibold uppercase text-xl w-full py-6">
              Không có dữ liệu cho chương này
            </p>
          ) : (
            comicData.current?.chapter[0].chapterData.chapterImages.map(
              (el) => (
                <Suspense
                  fallback={
                    <div className="relative mx-auto w-[200px] h-[300px]">
                      <Image
                        fill
                        src="/bg-match-item.png"
                        alt=""
                        className="rounded-md my-1 mx-auto"
                      />
                    </div>
                  }
                  key={el.imageFile}
                >
                  <RenderImageItem
                    key={el.imageFile}
                    imageLink={`${comicData.current?.chapter[0].chapterData.CDNPath}/${el.imageFile}`}
                  />
                </Suspense>
                // <Image
                //   src={`${comicData.current?.chapter[0].chapterData.CDNPath}/${el.imageFile}`}
                //   key={el.imageFile}
                //   alt=""
                //   width={0}
                //   height={0}
                //   sizes="100vw"
                //   loading="lazy"
                //   className="my-1 rounded-md"
                //   placeholder="blur"
                //   blurDataURL="/bg-match-item.png"
                //   style={{ width: "100%", height: "auto" }} // optional
                // />
              )
            )
          )}
        </div>
      </section>
      <AuxiliaryComponent isBottom={true} />
      <div className="light-out" id="light-out"></div>
    </React.Fragment>
  );
}
