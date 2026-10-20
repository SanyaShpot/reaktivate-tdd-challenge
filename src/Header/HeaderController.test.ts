import { describe, expect, it } from "vitest";
import { createBooksRepositoryMock } from "../Books/Books.testUtils";
import { PrivateBooksStore } from "../Books/PrivateBooksStore";
import { HeaderController } from "./HeaderController";

describe("HeaderController", () => {
  it("shows a placeholder until the private books count is known", () => {
    const store = new PrivateBooksStore(createBooksRepositoryMock());

    expect(new HeaderController(store).title).toBe("Your books: …");
  });

  it("shows the private books count after init", async () => {
    const repository = createBooksRepositoryMock([
      { name: "A", author: "X" },
      { name: "B", author: "Y" },
    ]);
    const store = new PrivateBooksStore(repository);
    const controller = new HeaderController(store);

    controller.init();
    await store.refresh();

    expect(controller.title).toBe("Your books: 2");
  });
});
