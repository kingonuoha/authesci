import Link from "next/link";

export default function Home() {
  return (
    <main className="min-h-screen bg-gradient-to-b from-slate-50 to-white flex items-center">
      <div className="container mx-auto px-6 py-20">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-4xl sm:text-5xl font-extrabold text-slate-900 mb-4">
            Authesci
          </h1>
          <p className="text-lg text-slate-600 mb-8">
            Connecting scientists, employers and collaborators — jobs, projects
            and research tools in one place.
          </p>

          <div className="flex flex-col sm:flex-row gap-3 justify-center mb-12">
            <Link
              href="/login"
              className="inline-flex items-center justify-center rounded-md bg-sky-600 px-5 py-3 text-white font-medium shadow hover:bg-sky-700 transition"
            >
              Get Started
            </Link>

            <Link
              href="/jobs"
              className="inline-flex items-center justify-center rounded-md border border-slate-200 px-5 py-3 text-slate-700 bg-white hover:shadow transition"
            >
              Browse Jobs
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="p-4 bg-white rounded-lg shadow-sm">
              <h3 className="font-semibold mb-2">Job Marketplace</h3>
              <p className="text-sm text-slate-600">
                Find or post scientific roles and collaborations.
              </p>
            </div>

            <div className="p-4 bg-white rounded-lg shadow-sm">
              <h3 className="font-semibold mb-2">Project Workspace</h3>
              <p className="text-sm text-slate-600">
                Create projects, invite collaborators and manage files.
              </p>
            </div>

            <div className="p-4 bg-white rounded-lg shadow-sm">
              <h3 className="font-semibold mb-2">In-Lab Mode</h3>
              <p className="text-sm text-slate-600">
                Preview of upcoming virtual lab and simulation features.
              </p>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
