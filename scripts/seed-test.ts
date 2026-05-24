import { PrismaClient } from "@prisma/client";
import { PrismaBetterSqlite3 } from "@prisma/adapter-better-sqlite3";
import path from "path";

const dbPath = path.join(__dirname, "..", "dev.db");

const adapter = new PrismaBetterSqlite3({
  url: `file:${dbPath}`,
});
const prisma = new PrismaClient({ adapter });

async function main() {
  // Create an unregistered sticker (for registration flow test)
  const unregisteredSticker = await prisma.sticker.upsert({
    where: { qrCodeId: "test-unregistered-001" },
    update: {},
    create: {
      qrCodeId: "test-unregistered-001",
      label: "Test Car - Unregistered",
      status: "unassigned",
    },
  });
  console.log("UNREGISTERED_QR_ID:" + unregisteredSticker.qrCodeId);

  // Create an owner
  const owner = await prisma.owner.upsert({
    where: { email: "test-owner@scanconnect.in" },
    update: {},
    create: {
      name: "Test Owner",
      phone: "9876543210",
      email: "test-owner@scanconnect.in",
      whatsapp: "9876543210",
    },
  });
  console.log("OWNER_PHONE:" + owner.phone);

  // Create a registered sticker linked to the owner (for edit page test)
  const registeredSticker = await prisma.sticker.upsert({
    where: { qrCodeId: "test-registered-001" },
    update: {},
    create: {
      qrCodeId: "test-registered-001",
      label: "Test Honda City",
      status: "active",
      ownerId: owner.id,
    },
  });
  console.log("REGISTERED_QR_ID:" + registeredSticker.qrCodeId);
}

main()
  .catch((e) => {
    console.error("SEED_ERROR:" + e.message);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
