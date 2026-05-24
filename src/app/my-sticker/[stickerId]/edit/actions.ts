"use server";

import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";

export async function updateSticker(
  qrCodeId: string,
  formData: FormData
) {
  const name = formData.get("name") as string;
  const phone = formData.get("phone") as string;
  const whatsapp = formData.get("whatsapp") as string;
  const email = formData.get("email") as string;
  const carLabel = formData.get("carLabel") as string;
  const otpId = formData.get("otpId") as string;

  if (!otpId) {
    throw new Error("Phone verification required. Please complete OTP verification first.");
  }

  const sticker = await prisma.sticker.findUnique({
    where: { qrCodeId },
    include: { owner: true },
  });

  if (!sticker) {
    throw new Error("Sticker not found");
  }

  if (!sticker.owner) {
    throw new Error("Sticker not yet registered. Please register first.");
  }

  // Verify OTP was completed for the owner's phone
  const verifiedOtp = await prisma.otp.findFirst({
    where: {
      id: otpId,
      phone: sticker.owner.phone.replace(/\D/g, ""),
      verified: true,
      expiresAt: { gte: new Date() },
    },
  });

  if (!verifiedOtp) {
    throw new Error("Phone verification expired or invalid. Please verify your phone again.");
  }

  // Update owner
  await prisma.owner.update({
    where: { id: sticker.owner.id },
    data: {
      name: name.trim(),
      phone: phone.trim(),
      email: email.trim() || sticker.owner.email,
      whatsapp: whatsapp.trim() || phone.trim(),
    },
  });

  // Update sticker label
  await prisma.sticker.update({
    where: { id: sticker.id },
    data: {
      label: carLabel.trim() || null,
    },
  });

  // Clean up used OTPs for this phone
  await prisma.otp.deleteMany({
    where: { phone: sticker.owner.phone.replace(/\D/g, "") },
  });

  redirect(`/my-sticker/${qrCodeId}/edit?updated=true`);
}

export async function deactivateSticker(qrCodeId: string, formData: FormData) {
  const otpId = formData.get("otpId") as string;

  if (!otpId) {
    throw new Error("Phone verification required. Please complete OTP verification first.");
  }

  const sticker = await prisma.sticker.findUnique({
    where: { qrCodeId },
    include: { owner: true },
  });

  if (!sticker || !sticker.owner) {
    throw new Error("Sticker not found or not registered");
  }

  // Verify OTP was completed for the owner's phone
  const verifiedOtp = await prisma.otp.findFirst({
    where: {
      id: otpId,
      phone: sticker.owner.phone.replace(/\D/g, ""),
      verified: true,
      expiresAt: { gte: new Date() },
    },
  });

  if (!verifiedOtp) {
    throw new Error("Phone verification expired or invalid. Please verify your phone again.");
  }

  await prisma.sticker.update({
    where: { id: sticker.id },
    data: { status: "inactive" },
  });

  // Clean up used OTPs for this phone
  await prisma.otp.deleteMany({
    where: { phone: sticker.owner.phone.replace(/\D/g, "") },
  });

  redirect(`/`);
}
