"use server";

import { prisma } from "@/lib/prisma";
import { sendSmsNotification } from "@/lib/sms";
import { sendWhatsAppNotification } from "@/lib/whatsapp";
import { sendEmailNotification } from "@/lib/email";
import { sendPushNotification } from "@/lib/webpush";
import { getContactRequestHtml, getContactRequestText } from "@/lib/email-templates";

export async function sendContactRequest(
  stickerId: string,
  message: string,
  callerName?: string
) {
  try {
    const sticker = await prisma.sticker.findUnique({
      where: { id: stickerId },
      include: { owner: true },
    });

    if (!sticker) {
      return { success: false, error: "Sticker not found" };
    }

    if (!sticker.owner) {
      return { success: false, error: "Sticker owner not found" };
    }

    const owner = sticker.owner;
    const sender = callerName || "Someone";
    const preview = message.length > 80 ? message.slice(0, 77) + "..." : message;

    // ── Check owner's notification preferences ──────────────
    let smsSuccess = false;
    let waSuccess = false;
    let emailSuccess = false;
    let pushSuccess = false;

    // ── Send SMS notification (if enabled) ──────────────────
    if (owner.smsEnabled) {
      const smsText = `ScanConnect: ${sender} sent you a message: "${preview}". Reply or call them back via your sticker's scan page.`;
      const smsResult = await sendSmsNotification(owner.phone, smsText);
      if (!smsResult.success) {
        console.error("Failed to send SMS notification:", smsResult.error);
      }
      smsSuccess = smsResult.success;
    }

    // ── Send WhatsApp notification (if enabled) ─────────────
    if (owner.whatsappEnabled) {
      const waTarget = owner.whatsapp || owner.phone;
      const waResult = await sendWhatsAppNotification(waTarget, {
        callerName: callerName,
        messagePreview: preview,
      });
      if (!waResult.success) {
        console.error("Failed to send WhatsApp notification:", waResult.error);
      }
      waSuccess = waResult.success;
    }

    // ── Send Email notification (if enabled) ────────────────
    if (owner.emailEnabled) {
      const dashboardUrl = `${process.env.BASE_URL || 'http://localhost:3000'}/dashboard/notifications`;
      const emailHtml = getContactRequestHtml({
        callerName: sender,
        message,
        ownerName: owner.name,
        carLabel: sticker.label,
        dashboardUrl,
      });
      const emailText = getContactRequestText({
        callerName: sender,
        message,
        ownerName: owner.name,
        carLabel: sticker.label,
        dashboardUrl,
      });
      const emailResult = await sendEmailNotification(owner.email, {
        subject: `New message from ${sender} via ScanConnect`,
        text: emailText,
        html: emailHtml,
      });
      if (!emailResult.success) {
        console.error("Failed to send email notification:", emailResult.error);
      }
      emailSuccess = emailResult.success;
    }

    // ── Persist contact request with delivery status ──────────
    await prisma.contactRequest.create({
      data: {
        stickerId: sticker.id,
        message: message.slice(0, 500),
        callerName: callerName?.slice(0, 50),
        smsDelivered: smsSuccess,
        whatsappDelivered: waSuccess,
        emailDelivered: emailSuccess,
      },
    });

    // ── Send push notification (if enabled) to all subscriptions ─
    if (owner.pushEnabled) {
      const subscriptions = await prisma.pushSubscription.findMany({
        where: { ownerId: owner.id },
      });
      for (const sub of subscriptions) {
        const pushResult = await sendPushNotification(sub, {
          title: `New message from ${sender}`,
          body: preview,
          url: `/dashboard/notifications`,
        });
        if (pushResult.success) pushSuccess = true;
        // Remove expired subscriptions
        if (!pushResult.success && pushResult.error === "subscription_expired") {
          await prisma.pushSubscription.deleteMany({
            where: { endpoint: sub.endpoint },
          }).catch(() => {});
        }
      }
    }

    return {
      success: true,
      notifiedVia: {
        sms: smsSuccess,
        whatsapp: waSuccess,
        email: emailSuccess,
        push: pushSuccess,
      },
    };
  } catch (err) {
    console.error("sendContactRequest error:", err);
    return { success: false, error: "Failed to send message" };
  }
}
