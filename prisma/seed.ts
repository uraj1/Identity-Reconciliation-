import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  // Create a primary contact
  const primaryContact = await prisma.contact.create({
    data: {
      email: 'john@example.com',
      phoneNumber: '9999999999',
      linkPrecedence: 'primary'
    }
  });

  console.log('Created primary contact:', primaryContact);

  // Create a secondary contact linked to the primary
  const secondaryContact = await prisma.contact.create({
    data: {
      email: 'john.alt@example.com',
      phoneNumber: null,
      linkedId: primaryContact.id,
      linkPrecedence: 'secondary'
    }
  });

  console.log('Created secondary contact:', secondaryContact);

  // Create another secondary contact with a different phone number
  const secondaryContact2 = await prisma.contact.create({
    data: {
      email: null,
      phoneNumber: '8888888888',
      linkedId: primaryContact.id,
      linkPrecedence: 'secondary'
    }
  });

  console.log('Created another secondary contact:', secondaryContact2);

  console.log('Seed completed successfully!');
}

main()
  .catch((e) => {
    console.error('Error during seeding:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });