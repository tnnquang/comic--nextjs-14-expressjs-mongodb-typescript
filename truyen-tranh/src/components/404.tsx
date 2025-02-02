import Link from "next/link";

import "@/styles/notfound.css"

export default function NotFoundComponent() {
  return (
    <section className="page_404 w-full">
      <div className="container">
        <div className="row">
          <div className="col-sm-12 ">
            <div className="col-sm-10 col-sm-offset-1  text-center">
              <div className="four_zero_four_bg">
                <h1 className="text-center text-background-900 font-bold text-2xl">404</h1>
              </div>

              <div className="contant_box_404">
                <h3 className="">Not Found</h3>

                <p>The requested page is not available!</p>

                <Link href="/" className="link_404">
                  Go Home
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
