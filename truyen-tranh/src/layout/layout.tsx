import HeaderComponent from "./header";
import FooterComponent from "./footer";
import StyledComponentsRegistry from "@/lib/AntdRegistry";
import { fetchAds, getDataHighestView, getListCategory } from "@/common/utils";

import {
  Row1AdsComponent,
  LeftSideAdsComponent,
  RightSideAdsComponent,
  PopupAdsComponent,
  FooterAdsComponent,
} from "@/components/AdsComponents/AdsComponent";

import DailyMonthlyHighestComponent from "@/components/ComicComponents/DailyMonthlyHighestComponent";

export default async function LayoutComponent({
  children,
}: {
  children: React.ReactNode;
}) {
  const [
    ads,
    categories,
    dataListHighestView
  ] = await Promise.all([
    fetchAds(),
    getListCategory(),
    getDataHighestView(),
  ]);

  return (
    <StyledComponentsRegistry>
      <HeaderComponent categories={categories} adsHeader={ads?.header} />
      <main className="main-container relative mx-auto mt-8 min-h-[100dvh] w-full max-w-[1800px] overflow-x-hidden px-4">
        <section className="ads-top-between-content flex flex-col items-start justify-center gap-4 sm:flex-row sm:gap-8"></section>
        <div className="md-4 relative w-full">
          <Row1AdsComponent dataAds={ads?.row1?.ads_content} />
          <div className="children-wrapper relative z-10 flex items-start gap-3 2lg:mx-[128px] overflow-hidden">
            <div className="main-children-content relative w-full z-20">
              {children}
            </div>
            <div className="w-full 2lg:w-fit relative z-10">
              <div className="comming-soon-films mt-3 h-full 2lg:mt-0">
                <p className="big-title mb-2 border-b-2 border-dashed border-b-[#5142FC] pb-2 text-xl font-semibold uppercase text-white 2lg:mb-6">
                  Đang Hot
                </p>
                <div className="h-auto w-full 2lg:w-[250px] xl:w-[300px]">
                  <DailyMonthlyHighestComponent
                    dataList={dataListHighestView}
                  />
                </div>
              </div>
            </div>
            <div className="fixed left-1/2 top-0 mx-auto hidden h-full w-full max-w-[1800px] -translate-x-1/2 px-4 2lg:block">
              <div className="max-auto w-full">
                <LeftSideAdsComponent dataAds={ads?.slide} />
                <RightSideAdsComponent dataAds={ads?.slide} />
              </div>
            </div>
          </div>
        </div>
        {/* <div className="fixed left-1/2 top-0 mx-auto hidden h-full w-full max-w-[1800px] -translate-x-1/2 px-4 2lg:block">
          <div className="max-auto w-full">
            <LeftSideAdsComponent dataAds={ads?.slide} />
            <RightSideAdsComponent dataAds={ads?.slide} />
          </div>
        </div> */}
      </main>
      <FooterComponent />
      <PopupAdsComponent dataAds={ads?.popup?.ads_content} />
      <FooterAdsComponent dataAds={ads?.footer?.ads_content} />
    </StyledComponentsRegistry>
  );
}
