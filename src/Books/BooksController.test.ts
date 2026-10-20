import { describe, expect, it, vi } from "vitest";
import type { Book } from "./Books.types";
import { createBooksRepositoryMock, flushPromises } from "./Books.testUtils";
import { BooksController } from "./BooksController";
import type { PrivateBooksStore } from "./PrivateBooksStore";

const BOOKS: Book[] = [{ name: "The Hobbit", author: "Tolkien" }];

const setup = (books: Book[] = BOOKS) => {
  const repository = createBooksRepositoryMock(books);
  const privateBooksStore = { refresh: vi.fn() } as unknown as PrivateBooksStore;
  const controller = new BooksController(repository, privateBooksStore);
  return { repository, privateBooksStore, controller };
};

describe("BooksController", () => {
  it("loads all books on init", async () => {
    const { controller, repository } = setup();

    controller.init();
    expect(controller.message).toBe("Loading…");
    await flushPromises();

    expect(repository.getBooks).toHaveBeenCalledWith("all", expect.any(AbortSignal));
    expect(controller.items).toEqual([{ key: "0", label: "Tolkien: The Hobbit" }]);
    expect(controller.message).toBe("");
  });

  it("shows an empty message when there are no books", async () => {
    const { controller } = setup([]);

    controller.init();
    await flushPromises();

    expect(controller.message).toBe("No books yet");
  });

  it("shows an error message when loading fails", async () => {
    vi.spyOn(console, "debug").mockImplementation(() => {});
    const { controller, repository } = setup();
    repository.getBooks.mockRejectedValue(new Error("offline"));

    controller.init();
    await flushPromises();

    expect(controller.message).toBe("Failed to load books");
  });

  it("marks the active filter and exposes mutually exclusive options", () => {
    const { controller } = setup();

    expect(controller.filterOptions.map(({ value, isActive }) => [value, isActive]))
      .toEqual([
        ["all", true],
        ["private", false],
      ]);

    controller.filterOptions[1].select();

    expect(controller.filterOptions.map(({ isActive }) => isActive)).toEqual([
      false,
      true,
    ]);
  });

  it("reloads books when another filter is selected", async () => {
    const { controller, repository } = setup();
    controller.init();
    await flushPromises();

    controller.setFilter("private");
    await flushPromises();

    expect(repository.getBooks).toHaveBeenLastCalledWith(
      "private",
      expect.any(AbortSignal)
    );
  });

  it("does not reload when the active filter is selected again", async () => {
    const { controller, repository } = setup();
    controller.init();
    await flushPromises();

    controller.setFilter("all");

    expect(repository.getBooks).toHaveBeenCalledTimes(1);
  });

  it("ignores a stale response after the filter was switched", async () => {
    const { controller, repository } = setup();
    let resolveFirst: (books: Book[]) => void = () => {};
    repository.getBooks.mockReturnValueOnce(
      new Promise<Book[]>((resolve) => {
        resolveFirst = resolve;
      })
    );
    repository.getBooks.mockResolvedValueOnce([{ name: "Private", author: "Me" }]);

    controller.init();
    controller.setFilter("private");
    await flushPromises();
    resolveFirst(BOOKS);
    await flushPromises();

    expect(controller.items).toEqual([{ key: "0", label: "Me: Private" }]);
  });

  it("reloads the list and refreshes the private counter after a book is added", async () => {
    const { controller, repository, privateBooksStore } = setup();
    controller.init();
    await flushPromises();
    controller.addBook.setName("Dune");
    controller.addBook.setAuthor("Frank Herbert");

    await controller.addBook.submit();

    expect(repository.getBooks).toHaveBeenCalledTimes(2);
    expect(privateBooksStore.refresh).toHaveBeenCalledOnce();
  });

  it("aborts the pending request on dispose", () => {
    const { controller, repository } = setup();
    repository.getBooks.mockReturnValue(new Promise(() => {}));
    controller.init();
    const signal = repository.getBooks.mock.calls[0][1];

    controller.dispose();

    expect(signal?.aborted).toBe(true);
  });
});
