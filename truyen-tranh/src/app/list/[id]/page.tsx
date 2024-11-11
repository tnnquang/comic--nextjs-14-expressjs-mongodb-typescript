import FilmsByListComponent from "@/components/ComicComponents/FilmsByListComponent";
import { getListCategory } from "@/common/utils";

type Props = {
  params: { id: string };
};

export default async function ListFilmPage({ params }: Props) {
  const id = params.id;
  const [categories] = await Promise.all([getListCategory()]);
  return <FilmsByListComponent id={id} listDataFilters={{ categories }} />;
}
