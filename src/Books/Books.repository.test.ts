import { describe, expect, it, vi } from "vitest";
import type { HttpGateway } from "../Shared/ApiGateway";
import { HttpBooksRepository } from "./Books.repository";

const createGateway = () => ({
  get: vi.fn(),
  post: vi.fn(),
});

const createRepository = (gateway: HttpGateway) =>
  new HttpBooksRepository(gateway);

describe("HttpBooksRepository", () => {
  it("requests all books from the root path and maps DTOs to books", async () => {
    const gateway = createGateway();
    gateway.get.mockResolvedValue([
      { id: 1, name: "Dune", author: "Frank Herbert", ownerId: "me" },
    ]);

    const books = await createRepository(gateway).getBooks("all");

    expect(gateway.get).toHaveBeenCalledWith("/", undefined);
    expect(books).toEqual([{ name: "Dune", author: "Frank Herbert" }]);
  });

  it("requests private books from the private path", async () => {
    const gateway = createGateway();
    gateway.get.mockResolvedValue([]);

    await createRepository(gateway).getBooks("private");

    expect(gateway.get).toHaveBeenCalledWith("/private", undefined);
  });

  it("posts only name and author when adding a book", async () => {
    const gateway = createGateway();
    gateway.post.mockResolvedValue({ status: "ok" });

    const isAdded = await createRepository(gateway).addBook({
      name: "Dune",
      author: "Frank Herbert",
    });

    expect(gateway.post).toHaveBeenCalledWith(
      "/",
      { name: "Dune", author: "Frank Herbert" },
      undefined
    );
    expect(isAdded).toBe(true);
  });

  it("reports failure when the API status is not ok", async () => {
    const gateway = createGateway();
    gateway.post.mockResolvedValue({ status: "error" });

    const isAdded = await createRepository(gateway).addBook({
      name: "Dune",
      author: "Frank Herbert",
    });

    expect(isAdded).toBe(false);
  });
});
