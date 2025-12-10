import { Prisma } from '@prisma/client';

// Example of creating a custom type for a profile with relations
export type ProfileWithJobs = Prisma.ProfileGetPayload<{
  include: { jobsPosted: true };
}>;

// Example of creating input types (useful for API routes/forms)
export type ProfileCreateInput = Prisma.ProfileCreateInput;
export type ProfileUpdateInput = Prisma.ProfileUpdateInput;

// Add more complex query types or custom type definitions as the project grows.
