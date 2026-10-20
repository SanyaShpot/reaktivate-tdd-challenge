import { describe, expect, it, vi } from "vitest";
import { createBooksRepositoryMock } from "./Books.testUtils";
import { PrivateBooksStore } from "./PrivateBooksStore";

describe("PrivateBooksStore", () => {
  it("has no count until refreshed", () => {
    const store = new PrivateBooksStore(createBooksRepositoryMock());

    expect(store.count).toBeNull();
  });

  it("stores the number of private books on refresh", async () => {
    const repository = createBooksRepositoryMock([
      { name: "A", author: "X" },
      { name: "B", author: "Y" },
    ]);
    const store = new PrivateBooksStore(repository);

    await store.refresh();

    expect(repository.getBooks).toHaveBeenCalledWith("private");
    expect(store.count).toBe(2);
  });

  it("keeps the previous count when refresh fails", async () => {
    vi.spyOn(console, "debug").mockImplementation(() => {});
    const repository = createBooksRepositoryMock([{ name: "A", author: "X" }]);
    const store = new PrivateBooksStore(repository);
    await store.refresh();
    repository.getBooks.mockRejectedValue(new Error("offline"));

    await store.refresh();

    expect(store.count).toBe(1);
  });
});
