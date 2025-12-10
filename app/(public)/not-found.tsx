import Link from "next/link";

export default function NotFound() {
    return (
        <section className="our-error">
            <div className="container">
                <div className="row align-items-center">
                    <div className="col-xl-6 offset-xl-3 text-center">
                        <div className="error_page footer_apps_widget">
                            <div className="erro_code">
                                <h1>404</h1>
                            </div>
                            <div className="h2 error_title">Page Not Found</div>
                            <p className="text fz15 mb20">
                                The page you are looking for might have been removed, had its name changed, or is temporarily unavailable.
                            </p>
                            <Link href="/" className="ud-btn btn-thm">
                                Back To Home
                            </Link>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}
