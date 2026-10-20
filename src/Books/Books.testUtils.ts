import { vi } from "vitest";
import type { BooksRepository } from "./Books.repository";
import type { Book } from "./Books.types";

export const flushPromises = () =>
  new Promise<void>((resolve) => setTimeout(resolve));

export const createBooksRepositoryMock = (books: Book[] = []) => ({
  getBooks: vi.fn<BooksRepository["getBooks"]>().mockResolvedValue(books),
  addBook: vi.fn<BooksRepository["addBook"]>().mockResolvedValue(true),
});
