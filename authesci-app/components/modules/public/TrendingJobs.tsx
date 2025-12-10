import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { JobStatus } from "@prisma/client";

async function getTrendingJobs() {
    try {
        const jobs = await prisma.job.findMany({
            where: { status: JobStatus.ACTIVE },
            take: 6,
            orderBy: { createdAt: "desc" },
            include: {
                employer: {
                    select: {
                        companyLogoUrl: true,
                        institution: true,
                        fullName: true,
                        avatarUrl: true,
                    },
                },
            },
        });
        return jobs;
    } catch (error) {
        console.error("Error fetching trending jobs:", error);
        return [];
    }
}

export default async function TrendingJobs() {
    const jobs = await getTrendingJobs();

    if (jobs.length < 3) {
        return null; // Don't show the section if there are fewer than 3 active jobs
    }

    return (
        <section className="pt30 pb90">
            <div className="container">
                <div className="row justify-content-center">
                    <div className="col-lg-6">
                        <div className="main-title text-center">
                            <h2>Trending Opportunities</h2>
                            <p className="paragraph">Discover the latest research roles and grants.</p>
                        </div>
                    </div>
                </div>
                <div className="row">
                    {jobs.map((job) => (
                        <div className="col-sm-6 col-xl-4" key={job.id}>
                            <div className="job-list-style1 bdr1">
                                <div className="icon d-flex align-items-center mb20">
                                    <div className="icon-img me-3 position-relative" style={{ width: '60px', height: '60px' }}>
                                        <img
                                            className="rounded-circle w-100 h-100 object-fit-cover"
                                            src={job.employer.companyLogoUrl || job.employer.avatarUrl || `https://ui-avatars.com/api/?name=${encodeURIComponent(
                                                job.employer.institution || job.employer.fullName
                                            )}&background=random`}
                                            alt={job.employer.institution || job.employer.fullName}
                                        />
                                    </div>
                                    <div className="icon-text">
                                        <span className="fz14 fw400">{job.employer.institution || job.employer.fullName}</span>
                                        <h6 className="title mb-0"><Link href={`/jobs/${job.id}`}>{job.title}</Link></h6>
                                    </div>
                                </div>
                                <div className="details">
                                    <p className="text mb20">
                                        {job.location || "Remote"}
                                        <span className="mx-2">•</span>
                                        {job.jobType}
                                    </p>
                                    <div className="list-meta d-flex justify-content-between align-items-center">
                                        <span className="flaticon-money fz14"> {job.salaryRange || "Negotiable"}</span>
                                        <Link href={`/jobs/${job.id}/apply`} className="ud-btn btn-light-thm">
                                            Apply Now <i className="fal fa-arrow-right-long"></i>
                                        </Link>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}
