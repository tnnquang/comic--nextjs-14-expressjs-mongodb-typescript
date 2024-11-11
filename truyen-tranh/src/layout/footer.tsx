
export default function FooterComponent() {
  return (
    <footer id="footer-container" className="w-full border-t border-t-blueSecondary mt-10 relative z-[1]">
      <div className="footer-wrapper mx-auto max-w-[1800px] py-6 text-center">
        Liên hệ quảng cáo:{" "}
        <a
          href="mailto:admin@cayphim.live"
          className="text-xl font-semibold text-blueSecondary"
          target="_blank"
        >
          Admin
        </a>
        <p className="px-4 lg:px-6 w-full mx-auto max-w-[768px]">
          Mọi dữ liệu trên trang web này đều được thu thập từ nhiều nguồn công khai khác nhau trên mạng Internet 
          và chúng tôi không giữ bản quyền hay lưu trữ bất kì phim nào!
        </p>
      </div>
    </footer>
  );
}
