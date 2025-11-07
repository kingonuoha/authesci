import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log(`Start seeding ...`);

  // Clear existing data (optional, for repeatable seeding)
  await prisma.application.deleteMany();
  await prisma.job.deleteMany();
  await prisma.profile.deleteMany();

  const employerProfile = await prisma.profile.upsert({
    where: { email: 'employer@example.com' },
    update: {},
    create: {
      email: 'employer@example.com',
      fullName: 'Acme Corp',
      role: 'EMPLOYER',
      userId: 'employer-user-id-1', // Add a dummy userId
    },
  });

  const scientistProfile = await prisma.profile.upsert({
    where: { email: 'scientist@example.com' },
    update: {},
    create: {
      email: 'scientist@example.com',
      fullName: 'Dr. Jane Doe',
      role: 'SCIENTIST',
      userId: 'scientist-user-id-1', // Add a dummy userId
    },
  });

  const job = await prisma.job.upsert({
    where: { title: 'Lead Researcher' },
    update: {},
    create: {
      title: 'Lead Researcher',
      description: 'Seeking a lead researcher for innovative projects.',
      status: 'ACTIVE',
      employerId: employerProfile.id,
      jobType: 'ON_SITE', // Add a jobType
      requirements: ['PhD', 'Research Experience'], // Add requirements
    },
  });

  await prisma.application.upsert({
    where: { jobId_applicantId: { applicantId: scientistProfile.id, jobId: job.id } },
    update: {},
    create: {
      applicantId: scientistProfile.id,
      jobId: job.id,
      status: 'PENDING',
      coverLetter: 'I am highly interested in this position.',
    },
  });

  console.log(`Seeding finished.`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
