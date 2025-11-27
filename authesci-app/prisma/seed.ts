import { PrismaClient, JobType, JobStatus, Role, ApplicationStatus } from '@prisma/client';

const prisma = new PrismaClient();

const SCIENTIST_TITLES = [
  "Senior Data Scientist", "Bioinformatics Researcher", "Lab Technician", 
  "Molecular Biologist", "Chemical Engineer", "Research Assistant",
  "Clinical Research Associate", "Microbiologist", "Environmental Scientist",
  "Pharmaceutical Researcher", "Genomic Analyst", "Biotechnologist",
  "Data Analyst (Health)", "Science Communicator", "Lab Manager",
  "Quality Control Chemist", "Forensic Scientist", "Marine Biologist",
  "Neuroscientist", "Epidemiologist"
];

const SKILLS_POOL = [
  "Python", "R", "PCR", "Cell Culture", "Data Analysis", "Machine Learning",
  "HPLC", "Microscopy", "Western Blotting", "SQL", "Statistics",
  "Project Management", "Technical Writing", "Grant Writing", "Bioinformatics"
];

const DUMMY_CVS = [
  "https://unimed.edu.ng/staff/documents/unimed_ats_133.pdf", // Placeholder
  "https://physicalscs.unn.edu.ng/wp-content/uploads/sites/14/2017/03/okagu-ogadimma.pdf"  // Placeholder
];

async function main() {
  console.log('Start seeding ...');

  // 1. Find the employer
  const employerEmail = 'kingonuoha01@gmail.com';
  let employer = await prisma.profile.findUnique({
    where: { email: employerEmail },
  });

  if (!employer) {
    console.log(`Employer with email ${employerEmail} not found. Creating placeholder...`);
    // Create a placeholder profile if it doesn't exist (Note: this won't have a real Supabase user)
    employer = await prisma.profile.create({
      data: {
        userId: 'placeholder_employer_id',
        email: employerEmail,
        fullName: 'King Onuoha',
        role: Role.EMPLOYER,
        bio: 'Leading research institution looking for top talent.',
        institution: 'Authesci Research Labs'
      }
    });
  }

  console.log(`Using employer: ${employer.fullName} (${employer.id})`);

  // 2. Create Jobs
  const jobs = [];
  for (let i = 0; i < 20; i++) {
    const title = SCIENTIST_TITLES[i % SCIENTIST_TITLES.length];
    const job = await prisma.job.create({
      data: {
        title: title,
        description: `We are looking for a talented ${title} to join our team. You will be responsible for conducting experiments, analyzing data, and contributing to our ongoing research projects. This is a great opportunity to work in a fast-paced and innovative environment.`,
        requirements: [
          "Ph.D. or Master's degree in a related field",
          "3+ years of experience in a laboratory setting",
          "Strong analytical and problem-solving skills",
          "Excellent communication and teamwork abilities"
        ],
        category: "Science & Research",
        jobType: i % 3 === 0 ? JobType.REMOTE : (i % 3 === 1 ? JobType.ON_SITE : JobType.HYBRID),
        location: i % 3 === 0 ? "Remote" : "Lagos, Nigeria",
        salaryRange: "₦200,000 - ₦500,000",
        finalPrice: 50000, // Fixed price for the job posting
        status: JobStatus.ACTIVE,
        employerId: employer.id,
        createdAt: new Date(Date.now() - Math.floor(Math.random() * 1000000000)), // Random past date
      }
    });
    jobs.push(job);
    console.log(`Created job: ${job.title}`);
  }

  // 3. Create Dummy Scientists
  const scientists = [];
  for (let i = 1; i <= 15; i++) {
    const email = `scientist${i}@test.com`;
    // Check if exists first to avoid unique constraint error on re-runs
    let scientist = await prisma.profile.findUnique({ where: { email } });
    
    if (!scientist) {
        scientist = await prisma.profile.create({
        data: {
            userId: `dummy_scientist_user_${i}`,
            email: email,
            fullName: `Scientist User ${i}`,
            role: Role.SCIENTIST,
            bio: `Passionate scientist with expertise in various fields. Dedicated to advancing knowledge and solving complex problems.`,
            skills: SKILLS_POOL.sort(() => 0.5 - Math.random()).slice(0, 5), // Random 5 skills
            experience: `${Math.floor(Math.random() * 10) + 1} years of experience in research.`,
            cvUrl: DUMMY_CVS[0], // Placeholder
            institution: `University of Test ${i}`,
            isPremium: Math.random() > 0.8, // 20% chance of being premium
        }
        });
    }
    scientists.push(scientist);
    console.log(`Created scientist: ${scientist.fullName}`);
  }

  // 4. Create Applications
  for (const job of jobs) {
    // Randomly assign 2-8 applicants to each job
    const numApplicants = Math.floor(Math.random() * 7) + 2;
    const shuffledScientists = scientists.sort(() => 0.5 - Math.random());
    const selectedScientists = shuffledScientists.slice(0, numApplicants);

    for (const scientist of selectedScientists) {
      // Check if application already exists
      const exists = await prisma.application.findUnique({
          where: {
              jobId_applicantId: {
                  jobId: job.id,
                  applicantId: scientist.id
              }
          }
      });

      if (!exists) {
          await prisma.application.create({
            data: {
              jobId: job.id,
              applicantId: scientist.id,
              coverLetter: `I am writing to express my strong interest in the ${job.title} position. With my background in ${scientist.skills[0]} and ${scientist.skills[1]}, I believe I would be a valuable asset to your team.`,
              resumeUrl: scientist.cvUrl || "https://example.com/resume.pdf",
              status: Math.random() > 0.8 ? ApplicationStatus.SHORTLISTED : ApplicationStatus.PENDING,
              aiMatchScore: Math.floor(Math.random() * 40) + 60, // Random score between 60 and 100
              createdAt: new Date(Date.now() - Math.floor(Math.random() * 500000000)),
            }
          });
          console.log(`Applied ${scientist.fullName} to ${job.title}`);
      }
    }
  }

  console.log('Seeding finished.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
