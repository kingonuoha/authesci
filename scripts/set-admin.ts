import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const email = process.argv[2];

  if (!email) {
    console.error('Please provide an email address as an argument.');
    console.log('Usage: npx tsx scripts/set-admin.ts <email>');
    process.exit(1);
  }

  try {
    const user = await prisma.profile.findUnique({
        where: { email }
    });

    if (!user) {
        console.error(`User with email ${email} not found.`);
        process.exit(1);
    }

    const updatedUser = await prisma.profile.update({
      where: { email },
      data: { role: 'ADMIN' },
    });

    console.log(`SUCCESS: User ${updatedUser.email} (ID: ${updatedUser.id}) has been promoted to ADMIN.`);
  } catch (error) {
    console.error('Error updating user:', error);
  } finally {
    await prisma.$disconnect();
  }
}

main();
