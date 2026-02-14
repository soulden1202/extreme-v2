
import { cn } from "@/lib/utils";

describe("cn utility", () => {
  it("should merge class names correctly", () => {
    expect(cn("bg-red-500", "text-white")).toBe("bg-red-500 text-white");
  });

  it("should handle conditional classes", () => {
    expect(cn("bg-red-500", true && "text-white", false && "hidden")).toBe("bg-red-500 text-white");
  });

  it("should merge tailwind classes properly (override)", () => {
    expect(cn("bg-red-500", "bg-blue-500")).toBe("bg-blue-500");
  });

  it("should handle arrays and objects", () => {
    expect(cn("text-base", ["p-4", { "m-4": true }])).toBe("text-base p-4 m-4");
  });
});
