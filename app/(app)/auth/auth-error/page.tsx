import Link from "next/link";

export default function AuthErrorPage() {
    return (
        <section className="our-error">
            <div className="container">
                <div className="row align-items-center">
                    <div className="col-xl-6 offset-xl-3 text-center">
                        <div className="error_page footer_apps_widget">
                            <div className="h2 error_title">Authentication Error</div>
                            <p className="text fz15 mb20">
                                An error occurred during the authentication process. This could be due to an invalid request, session expiration, or a server issue.
                            </p>
                            <Link href="/login" className="ud-btn btn-thm m-2">
                                Back to Login
                            </Link>
                            <Link href="/" className="ud-btn btn-thm m-2">
                                Back To Home
                            </Link>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}
