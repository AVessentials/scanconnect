import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import NewStickerForm from "./NewStickerForm";

export const dynamic = "force-dynamic";

async function createSticker(formData: FormData) {
  "use server";

  const ownerName = formData.get("ownerName") as string | null;
  const phone = formData.get("phone") as string | null;
  const email = formData.get("email") as string | null;
  const whatsapp = formData.get("whatsapp") as string | null;
  const carLabel = formData.get("carLabel") as string | null;

  let ownerId: string | undefined;

  if (ownerName && phone) {
    // Create or find owner
    const owner = await prisma.owner.upsert({
      where: { email: email || `temp-${Date.now()}@scanconnect.in` },
      update: { name: ownerName, phone, whatsapp: whatsapp || phone },
      create: {
        name: ownerName,
        phone,
        email: email || `owner-${Date.now()}@scanconnect.in`,
        whatsapp: whatsapp || phone,
      },
    });
    ownerId = owner.id;
  }

  const sticker = await prisma.sticker.create({
    data: {
      label: carLabel || undefined,
      status: ownerId ? "active" : "unassigned",
      ownerId,
    },
  });

  redirect(`/dashboard/stickers/${sticker.id}`);
}

export default function NewStickerPage() {
  return (
    <div className="max-w-lg mx-auto">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-zinc-900">Create New Sticker</h1>
        <p className="text-sm text-zinc-500 mt-1">
          Generate a new QR sticker. Optionally assign it to an owner right away.
        </p>
      </div>

      <div className="bg-white rounded-2xl border border-zinc-200 p-6">
        <NewStickerForm createSticker={createSticker} />
      </div>
    </div>
  );
}
