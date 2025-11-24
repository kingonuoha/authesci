import { prisma } from "@/lib/prisma";
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { Users, CheckCircle, Clock, ListTodo } from "lucide-react";
import EscrowCard from "@/components/modules/payment/EscrowCard";

export default async function ProjectPage({ params }: { params: Promise<{ projectId: string }> }) {
  const { projectId } = await params;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) redirect("/login");

  const project = await prisma.project.findUnique({
    where: { id: projectId },
    include: {
      collaborators: {
        include: {
          user: {
            select: {
              fullName: true,
              avatarUrl: true,
              email: true
            }
          }
        }
      },
      tasks: true,
      payments: true
    }
  });

  const profile = await prisma.profile.findUnique({
    where: { userId: user.id },
    select: { role: true }
  });

  if (!project) {
    const role = profile?.role.toLowerCase() || 'scientist';
    redirect(`/${role}/dashboard`);
  }

  const totalTasks = project.tasks.length;
  const doneTasks = project.tasks.filter(t => t.status === 'DONE').length;
  const inProgressTasks = project.tasks.filter(t => t.status === 'IN_PROGRESS').length;
  const todoTasks = project.tasks.filter(t => t.status === 'OPEN').length;
  
  const progress = totalTasks > 0 ? Math.round((doneTasks / totalTasks) * 100) : 0;

  const payment = project.payments[0]; // Assuming single payment for now
  
  // Check if current user is the employer (Owner)
  const isEmployer = project.collaborators.some(c => c.userId === user.id && c.role === 'OWNER');

  return (
    <div className="p-6 space-y-6">
      {/* Header Section */}
      <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
        <div>
          <h2 className="text-2xl font-bold text-neutral-900 dark:text-white mb-1">{project.title}</h2>
          <p className="text-neutral-600 dark:text-neutral-400 text-sm">{project.description || "Project Overview"}</p>
        </div>
        <div className="flex items-center gap-3">
           <div className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-neutral-800 rounded-lg border border-gray-200 dark:border-neutral-700">
              <Clock className="w-4 h-4 text-neutral-500" />
              <span className="text-sm font-medium text-neutral-700 dark:text-neutral-300">Created {new Date(project.createdAt).toLocaleDateString()}</span>
           </div>
        </div>
      </div>

      {/* Stats Grid - Inspired by index.html */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Total Tasks */}
        <div className="card shadow-none border border-gray-200 dark:border-neutral-600 dark:bg-neutral-700 rounded-lg h-full bg-gradient-to-r from-cyan-600/10 to-transparent">
          <div className="card-body p-5">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <p className="font-medium text-neutral-900 dark:text-white mb-1">Total Tasks</p>
                <h6 className="text-2xl font-bold mb-0 dark:text-white">{totalTasks}</h6>
              </div>
              <div className="w-[50px] h-[50px] bg-cyan-600 rounded-full flex justify-center items-center">
                <ListTodo className="text-white text-2xl" />
              </div>
            </div>
            <p className="font-medium text-sm text-neutral-600 dark:text-white mt-3 mb-0 flex items-center gap-2">
              <span className="inline-flex items-center gap-1 text-cyan-600 dark:text-cyan-400">
                View Details
              </span> 
            </p>
          </div>
        </div>

        {/* In Progress */}
        <div className="card shadow-none border border-gray-200 dark:border-neutral-600 dark:bg-neutral-700 rounded-lg h-full bg-gradient-to-r from-yellow-600/10 to-transparent">
          <div className="card-body p-5">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <p className="font-medium text-neutral-900 dark:text-white mb-1">In Progress</p>
                <h6 className="text-2xl font-bold mb-0 dark:text-white">{inProgressTasks}</h6>
              </div>
              <div className="w-[50px] h-[50px] bg-yellow-600 rounded-full flex justify-center items-center">
                <Clock className="text-white text-2xl" />
              </div>
            </div>
            <p className="font-medium text-sm text-neutral-600 dark:text-white mt-3 mb-0 flex items-center gap-2">
              <span className="inline-flex items-center gap-1 text-yellow-600 dark:text-yellow-400">
                Active Now
              </span> 
            </p>
          </div>
        </div>

        {/* Completed */}
        <div className="card shadow-none border border-gray-200 dark:border-neutral-600 dark:bg-neutral-700 rounded-lg h-full bg-gradient-to-r from-green-600/10 to-transparent">
          <div className="card-body p-5">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <p className="font-medium text-neutral-900 dark:text-white mb-1">Completed</p>
                <h6 className="text-2xl font-bold mb-0 dark:text-white">{doneTasks}</h6>
              </div>
              <div className="w-[50px] h-[50px] bg-green-600 rounded-full flex justify-center items-center">
                <CheckCircle className="text-white text-2xl" />
              </div>
            </div>
            <p className="font-medium text-sm text-neutral-600 dark:text-white mt-3 mb-0 flex items-center gap-2">
              <span className="inline-flex items-center gap-1 text-green-600 dark:text-green-400">
                {progress}% Done
              </span> 
            </p>
          </div>
        </div>

        {/* Team Members Count */}
        <div className="card shadow-none border border-gray-200 dark:border-neutral-600 dark:bg-neutral-700 rounded-lg h-full bg-gradient-to-r from-purple-600/10 to-transparent">
          <div className="card-body p-5">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <p className="font-medium text-neutral-900 dark:text-white mb-1">Team Members</p>
                <h6 className="text-2xl font-bold mb-0 dark:text-white">{project.collaborators.length}</h6>
              </div>
              <div className="w-[50px] h-[50px] bg-purple-600 rounded-full flex justify-center items-center">
                <Users className="text-white text-2xl" />
              </div>
            </div>
            <p className="font-medium text-sm text-neutral-600 dark:text-white mt-3 mb-0 flex items-center gap-2">
              <span className="inline-flex items-center gap-1 text-purple-600 dark:text-purple-400">
                Collaborators
              </span> 
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-12 gap-6">
        {/* Project Progress Chart Area (Placeholder for now, reusing structure) */}
        <div className="xl:col-span-8">
          <div className="card h-full rounded-lg border border-gray-200 dark:border-neutral-600 dark:bg-neutral-700">
            <div className="card-body p-6">
              <h6 className="text-lg font-bold mb-4 text-neutral-900 dark:text-white">Project Progress</h6>
              <div className="relative pt-1">
                <div className="flex mb-2 items-center justify-between">
                  <div>
                    <span className="text-xs font-semibold inline-block py-1 px-2 uppercase rounded-full text-purple-600 bg-purple-200 dark:bg-purple-900/30 dark:text-purple-300">
                      Task Completion
                    </span>
                  </div>
                  <div className="text-right">
                    <span className="text-xs font-semibold inline-block text-purple-600 dark:text-purple-300">
                      {progress}%
                    </span>
                  </div>
                </div>
                <div className="overflow-hidden h-4 mb-4 text-xs flex rounded bg-purple-200 dark:bg-neutral-600">
                  <div style={{ width: `${progress}%` }} className="shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center bg-purple-600 transition-all duration-500"></div>
                </div>
              </div>
              
              <div className="mt-8">
                 <h6 className="text-lg font-bold mb-4 text-neutral-900 dark:text-white">Recent Activity</h6>
                 <div className="text-center py-8 text-neutral-500 dark:text-neutral-400 bg-gray-50 dark:bg-neutral-800/50 rounded-lg border border-dashed border-gray-300 dark:border-neutral-600">
                    No recent activity to show.
                 </div>
              </div>
            </div>
          </div>
        </div>

        {/* Team Members List & Escrow */}
        <div className="xl:col-span-4 space-y-6">
          {payment && (
            <EscrowCard 
                totalAmount={Number(payment.amount)} 
                platformFee={Number(payment.platformFee)} 
                scientistAmount={Number(payment.scientistAmount)}
                isEmployer={isEmployer}
            />
          )}

          <div className="card h-full rounded-lg border border-gray-200 dark:border-neutral-600 dark:bg-neutral-700">
            <div className="card-body p-6">
              <div className="flex items-center justify-between mb-6">
                <h6 className="text-lg font-bold mb-0 text-neutral-900 dark:text-white">Team Members</h6>
                <span className="text-sm text-neutral-500 dark:text-neutral-400">{project.collaborators.length} Users</span>
              </div>
              
              <div className="space-y-6">
                {project.collaborators.map((member) => (
                    <div key={member.id} className="flex items-center justify-between gap-3">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full overflow-hidden bg-gray-200 flex-shrink-0">
                                {member.user.avatarUrl ? (
                                    <img src={member.user.avatarUrl} alt={member.user.fullName || 'User'} className="w-full h-full object-cover" />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center text-gray-500 font-bold bg-gray-300 dark:bg-neutral-600 dark:text-gray-300">
                                        {member.user.fullName?.[0] || 'U'}
                                    </div>
                                )}
                            </div>
                            <div>
                                <h6 className="text-base mb-0 font-medium text-neutral-900 dark:text-white">{member.user.fullName}</h6>
                                <span className="text-sm text-neutral-500 dark:text-neutral-400 block truncate max-w-[150px]">{member.user.email}</span>
                            </div>
                        </div>
                        <span className="text-xs font-medium px-2 py-1 rounded bg-gray-100 dark:bg-neutral-600 text-gray-600 dark:text-gray-300 capitalize">
                            {member.role.toLowerCase().replace('_', ' ')}
                        </span>
                    </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
