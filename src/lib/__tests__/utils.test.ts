import { describe, it, expect } from "vitest";
import { timeAgo } from "../utils";

describe("timeAgo", () => {
  it('returns "just now" for dates less than 60 seconds ago', () => {
    const now = new Date();
    expect(timeAgo(new Date(now.getTime() - 1000))).toBe("just now");
    expect(timeAgo(new Date(now.getTime() - 30000))).toBe("just now");
    expect(timeAgo(new Date(now.getTime() - 59000))).toBe("just now");
  });

  it('returns "Xm ago" for dates between 1 and 59 minutes ago', () => {
    const now = new Date();
    expect(timeAgo(new Date(now.getTime() - 5 * 60 * 1000))).toBe("5m ago");
    expect(timeAgo(new Date(now.getTime() - 59 * 60 * 1000))).toBe("59m ago");
  });

  it('returns "Xh ago" for dates between 1 and 23 hours ago', () => {
    const now = new Date();
    expect(timeAgo(new Date(now.getTime() - 3 * 60 * 60 * 1000))).toBe("3h ago");
    expect(timeAgo(new Date(now.getTime() - 23 * 60 * 60 * 1000))).toBe("23h ago");
  });

  it('returns "Xd ago" for dates between 1 and 6 days ago', () => {
    const now = new Date();
    expect(timeAgo(new Date(now.getTime() - 2 * 24 * 60 * 60 * 1000))).toBe("2d ago");
    expect(timeAgo(new Date(now.getTime() - 6 * 24 * 60 * 60 * 1000))).toBe("6d ago");
  });

  it("returns localized date string for dates 7+ days ago", () => {
    const now = new Date();
    const old = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    expect(timeAgo(old)).toBe(old.toLocaleDateString());
  });

  it("handles future dates gracefully", () => {
    const future = new Date(Date.now() + 10000);
    expect(timeAgo(future)).toBe("just now");
  });

  it("handles invalid dates gracefully", () => {
    const invalid = new Date("invalid");
    expect(timeAgo(invalid)).toBe(invalid.toLocaleDateString());
  });
});
