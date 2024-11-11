import { FaHome } from "react-icons/fa";

export const listCategoryToShow = [
  {
    label: "Tình Cảm",
    slug: "tinh-cam",
  },
  {
    label: "Hành Động",
    slug: "hanh-dong",
  },
  {
    label: "Phiêu Lưu",
    slug: "phieu-luu",
  },
  {
    label: "Kiếm Hiệp",
    slug: "kiem-hiep",
  },
  {
    label: "Chính Kịch",
    slug: "chinh-kinh",
  },
  {
    label: "Viễn Tưởng",
    slug: "vien-tuong",
  },
  {
    label: "Đam Mỹ",
    slug: "dam-my",
  },
  {
    label: "Khoa Học",
    slug: "khoa-hoc",
  },
  {
    label: "Chiến Tranh",
    slug: "chien-tranh",
  },
  {
    label: "Cổ Trang",
    slug: "co-trang",
  },
  {
    label: "Thần Thoại",
    slug: "than-thoai",
  },
  {
    label: "Võ Thuật",
    slug: "vo-thuat",
  },
  {
    label: "TV Shows",
    slug: "tv-shows",
  },
  {
    label: "Ma - Kinh Dị",
    slug: "kinh-di",
  },
  {
    label: "Hoạt Hình",
    slug: "hoat-hinh",
  },
];

export const listCountryToShow = [
  {
    label: "Việt Nam",
    slug: "viet-nam",
  },
  {
    label: "Trung Quốc",
    slug: "trung-quoc",
  },
  {
    label: "Hàn Quốc",
    slug: "han-quoc",
  },
  {
    label: "Âu Mỹ",
    slug: "au-my",
  },
  {
    label: "Anh",
    slug: "anh",
  },
  {
    label: "Thái Lan",
    slug: "thai-lan",
  },
  {
    label: "Pháp",
    slug: "phap",
  },
  {
    label: "Ấn Độ",
    slug: "an-do",
  },
  {
    label: "Nhật Bản",
    slug: "nhat-ban",
  },
];

export const menus = [
  {
    name: "Home",
    slug: "/",
    icon: <FaHome size={16} />,
    sub: false,
  },

  {
    name: "Truyện mới",
    slug: "/list/truyen-moi",
    sub: false,
  },
  {
    name: "Thể loại",
    slug: "/category",
    sub: true,
    startWith: "/category",
  },
  {
    name: "Ngôn tình",
    slug: "/category/ngon-tinh",
    sub: false,
  },
  {
    name: "Lãng mạn",
    slug: "/category/romance",
    sub: false,
  },
  {
    name: "Trinh thám",
    slug: "/category/trinh-tham",
    sub: false,
  },
];
