"use server";

import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";

export async function registerSticker(
  qrCodeId: string,
  formData: FormData
) {
  const name = formData.get("name") as string;
  const phone = formData.get("phone") as string;
  const whatsapp = formData.get("whatsapp") as string || phone;
  const email = formData.get("email") as string;
  const carLabel = formData.get("carLabel") as string;
  const otpId = formData.get("otpId") as string;

  if (!otpId) {
    throw new Error("Phone verification required. Please complete OTP verification first.");
  }

  // Verify that the OTP was actually verified for this phone
  const verifiedOtp = await prisma.otp.findFirst({
    where: {
      id: otpId,
      phone: phone.replace(/\D/g, ""),
      verified: true,
      expiresAt: { gte: new Date() },
    },
  });

  if (!verifiedOtp) {
    throw new Error("Phone verification expired or invalid. Please verify your phone again.");
  }

  // Find the sticker
  const sticker = await prisma.sticker.findUnique({
    where: { qrCodeId },
    include: { owner: true },
  });

  if (!sticker) {
    throw new Error("Sticker not found");
  }

  if (sticker.owner) {
    throw new Error("This sticker is already registered");
  }

  // Create or reuse owner by phone number (deduplicate)
  const cleanPhone = phone.trim();
  let owner = await prisma.owner.findFirst({
    where: { phone: cleanPhone },
  });

  if (owner) {
    // Update existing owner's info with latest details
    owner = await prisma.owner.update({
      where: { id: owner.id },
      data: {
        name: name.trim(),
        email: email.trim() || `owner-${Date.now()}@scanconnect.in`,
        whatsapp: whatsapp.trim(),
      },
    });
  } else {
    owner = await prisma.owner.create({
      data: {
        name: name.trim(),
        phone: cleanPhone,
        email: email.trim() || `owner-${Date.now()}@scanconnect.in`,
        whatsapp: whatsapp.trim(),
      },
    });
  }

  // Update the sticker to be active and linked to the owner
  await prisma.sticker.update({
    where: { id: sticker.id },
    data: {
      ownerId: owner.id,
      status: "active",
      label: carLabel.trim() || null,
    },
  });

  // Clean up used OTPs for this phone
  await prisma.otp.deleteMany({
    where: { phone: cleanPhone },
  });

  redirect(`/register/${qrCodeId}/success`);
}
