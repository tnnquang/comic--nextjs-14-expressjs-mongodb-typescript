import { getListCategory } from "@/common/utils";
import ListFilmByCategoryComponent from "@/components/ComicComponents/ListFilmByCategoryComponent";

type Props = {
  params: { slug: string };
};

// export async function generateStaticParams() {
//   const listCate = await getListCategory();
//   console.log("listCategoryyyyy", listCate)
//   return listCate.map((cate: any) => ({ slug: cate.slug }));
// }

export default async function ListFilmByCategoryPage({ params }: Props) {
  const slug = params.slug;
  const [categories] = await Promise.all([getListCategory()]);
  return (
    <ListFilmByCategoryComponent
      slug={slug}
      listDataFilter={{
        categories,
      }}
    />
  );
}
