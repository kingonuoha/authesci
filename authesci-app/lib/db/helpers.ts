import { Prisma } from '@prisma/client';

export class NotFoundError extends Error {
  constructor(message: string = 'Resource not found') {
    super(message);
    this.name = 'NotFoundError';
  }
}

export class DuplicateError extends Error {
  constructor(message: string = 'Resource already exists') {
    super(message);
    this.name = 'DuplicateError';
  }
}

export function handlePrismaError(error: unknown): Error {
  if (error instanceof Prisma.PrismaClientKnownRequestError) {
    // P2002: Unique constraint violation
    if (error.code === 'P2002') {
      const target = (error.meta?.target as string[])?.join(', ') || 'record';
      return new DuplicateError(`A record with this ${target} already exists.`);
    }
    // P2025: Record to update/delete not found
    if (error.code === 'P2025') {
      return new NotFoundError(error.message.split('\n')[0]);
    }
    // Add more specific error codes as needed
  }
  return error instanceof Error ? error : new Error(String(error));
}

// Example usage:
// try {
//   await prisma.profile.create({ data: { email: 'test@example.com' } });
// } catch (e) {
//   throw handlePrismaError(e);
// }