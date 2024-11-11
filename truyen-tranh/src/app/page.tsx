import { fetchAds } from "@/common/utils";
import {
  Row2AdsComponent,
  Row3AdsComponent,
} from "@/components/AdsComponents/AdsComponent";
import ListShowListItemWithAnyCategoryComponent from "@/components/ComicComponents/ListShowListItemWithAnyCategoryComponent";

// import configItemDisplayedInHomePage from "@/configs/pageShowData.json";
import React from "react";

import { revalidatePath } from "next/cache";
import { readFileSync } from "fs";
import path from "path";

async function getFile() {
  const filePath = path.join(
    process.cwd(),
    "public",
    "configs",
    "pageShowData.json"
  );
  const jsonData = readFileSync(filePath, "utf-8");
  const configItemDisplayedInHomePage = JSON.parse(jsonData);
  revalidatePath("/");
  return configItemDisplayedInHomePage;
}

export default async function Home() {
  const [ads, configItemDisplayedInHomePage] = await Promise.all([
    fetchAds(),
    getFile(),
  ]);
  return (
    <section className="home-page mx-auto w-full">
      {/* <TabCategoryFilmComponent tab={tab as string} /> */}
      <ListShowListItemWithAnyCategoryComponent
        title={"Mới cập nhật"}
        categorySlug={"new-post"}
        categoryName={"New Post"}
        isNewPost={true}
      />
      {configItemDisplayedInHomePage
        .filter((e: any) => e.page === "Home")[0]
        ?.listItemWillBeDisplayed.map(async (item: any, index: number) =>
          index === 0 ? (
            <React.Fragment key={index}>
              <ListShowListItemWithAnyCategoryComponent
                title={item?.title}
                categorySlug={item?.categoryPath}
                categoryName={item?.categoryName}
              />
              <Row2AdsComponent dataAds={ads?.row2?.ads_content} />
            </React.Fragment>
          ) : index === 1 ? (
            <React.Fragment key={index}>
              <ListShowListItemWithAnyCategoryComponent
                title={item?.title}
                categorySlug={item?.categoryPath}
                categoryName={item?.categoryName}
              />
              <Row3AdsComponent dataAds={ads?.row3?.ads_content} />
            </React.Fragment>
          ) : (
            <ListShowListItemWithAnyCategoryComponent
              key={index}
              title={item?.title}
              categorySlug={item?.categoryPath}
              categoryName={item?.categoryName}
            />
          )
        )}
    </section>
  );
}
