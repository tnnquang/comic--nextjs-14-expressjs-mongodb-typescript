import { BASE_URL_API, BASE_URL_FRONTEND } from "@/common/constant";
import { IFilm } from "@/configs/types";
import { MetadataRoute } from "next/types";

const LIMIT_PER_SITEMAP = 7000;

export async function generateSitemaps() {
  const totalPages: number = await fetch(
    `${BASE_URL_API}/comic/total-page-from-limit?limit=${LIMIT_PER_SITEMAP}`
  )
    .then((e) => e.json())
    .then((val) => val.result);
  // Fetch the total number of products and calculate the number of sitemaps needed
  return Array.from({ length: totalPages }, (v, k) => k).map((e) => ({
    id: e,
  }));
}

export default async function sitemap({
  id,
}: {
  id: number;
}): Promise<MetadataRoute.Sitemap> {
  // Google's limit is 50,000 URLs per sitemap
  const start = id * LIMIT_PER_SITEMAP;
  const end = start + LIMIT_PER_SITEMAP;
  const films = await fetch(
    `${BASE_URL_API}/comic/all-slug?start=${start}&end=${end}`,
    {
      method: "POST",
    }
  )
    .then((value) => value.json())
    .then((data) => data.result);
  return films.map((film: IFilm) => ({
    url: `${BASE_URL_FRONTEND}/detail/${film.slug}`,
    lastModified: film.updatedAt,
    changeFrequency: "weekly",
    priority: 0.7,
  }));
}
