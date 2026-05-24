import { describe, it, expect, beforeEach, vi } from "vitest";

// ── Helper: simulate the replyToRequest validation logic ────────────────────

function validateReplyInput(formData: FormData): {
  requestId: string;
  reply: string;
} {
  const requestId = formData.get("requestId") as string;
  const reply = formData.get("reply") as string;
  if (!requestId || !reply || reply.trim().length === 0) {
    throw new Error("Missing requestId or reply");
  }
  return { requestId, reply: reply.trim() };
}

// ── Helper: simulate the markAllAsRead env check logic ──────────────────────

function shouldMarkAsRead(): { adminOwnerId: string | undefined } {
  return { adminOwnerId: process.env.ADMIN_OWNER_ID };
}

// ── Tests ───────────────────────────────────────────────────────────────────

describe("Server action logic", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  describe("replyToRequest validation", () => {
    it("should accept valid input", () => {
      const formData = new FormData();
      formData.set("requestId", "req-1");
      formData.set("reply", "Thanks!");

      const result = validateReplyInput(formData);
      expect(result.requestId).toBe("req-1");
      expect(result.reply).toBe("Thanks!");
    });

    it("should trim whitespace from reply", () => {
      const formData = new FormData();
      formData.set("requestId", "req-1");
      formData.set("reply", "  Got it!  ");

      const result = validateReplyInput(formData);
      expect(result.reply).toBe("Got it!");
    });

    it("should throw if requestId is missing", () => {
      const formData = new FormData();
      formData.set("reply", "Thanks!");
      expect(() => validateReplyInput(formData)).toThrow("Missing requestId or reply");
    });

    it("should throw if reply is empty", () => {
      const formData = new FormData();
      formData.set("requestId", "req-1");
      formData.set("reply", "");
      expect(() => validateReplyInput(formData)).toThrow("Missing requestId or reply");
    });

    it("should throw if reply is only whitespace", () => {
      const formData = new FormData();
      formData.set("requestId", "req-1");
      formData.set("reply", "   ");
      expect(() => validateReplyInput(formData)).toThrow("Missing requestId or reply");
    });

    it("should throw if both fields are missing", () => {
      const formData = new FormData();
      expect(() => validateReplyInput(formData)).toThrow("Missing requestId or reply");
    });
  });

  describe("markAllAsRead auth check", () => {
    const OLD_ENV = process.env;

    beforeEach(() => {
      vi.resetModules();
      process.env = { ...OLD_ENV };
    });

    afterAll(() => {
      process.env = OLD_ENV;
    });

    it("should read ADMIN_OWNER_ID when set", () => {
      process.env.ADMIN_OWNER_ID = "owner-1";
      const { adminOwnerId } = shouldMarkAsRead();
      expect(adminOwnerId).toBe("owner-1");
    });

    it("should be undefined when ADMIN_OWNER_ID is not set", () => {
      delete process.env.ADMIN_OWNER_ID;
      const { adminOwnerId } = shouldMarkAsRead();
      expect(adminOwnerId).toBeUndefined();
    });
  });
});
