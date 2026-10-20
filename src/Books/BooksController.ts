import { makeAutoObservable, runInAction } from "mobx";
import type { SegmentedOption } from "../Shared/components/SegmentedControl";
import type { Controller } from "../Shared/hooks/useController";
import { AddBookController } from "./AddBook/AddBookController";
import type { BooksRepository } from "./Books.repository";
import type { Book, BooksFilter } from "./Books.types";
import type { PrivateBooksStore } from "./PrivateBooksStore";

type Status = "idle" | "loading" | "success" | "error";

const FILTER_LABELS: Record<BooksFilter, string> = {
  all: "All books",
  private: "Private books",
};

const FILTERS = Object.keys(FILTER_LABELS) as BooksFilter[];

export class BooksController implements Controller {
  filter: BooksFilter = "all";
  books: Book[] = [];
  status: Status = "idle";

  readonly addBook: AddBookController;

  private readonly repository: BooksRepository;
  private readonly privateBooksStore: PrivateBooksStore;
  private request: AbortController | null = null;

  constructor(
    repository: BooksRepository,
    privateBooksStore: PrivateBooksStore
  ) {
    this.repository = repository;
    this.privateBooksStore = privateBooksStore;
    this.addBook = new AddBookController(repository, this.handleBookAdded);
    makeAutoObservable<
      BooksController,
      "repository" | "privateBooksStore" | "request"
    >(this, {
      addBook: false,
      repository: false,
      privateBooksStore: false,
      request: false,
    });
  }

  get filterOptions(): SegmentedOption[] {
    return FILTERS.map((value) => ({
      value,
      label: FILTER_LABELS[value],
      isActive: value === this.filter,
      select: () => this.setFilter(value),
    }));
  }

  get items() {
    return this.books.map(({ author, name }, index) => ({
      key: String(index),
      label: `${author}: ${name}`,
    }));
  }

  get message() {
    switch (this.status) {
      case "loading":
        return "Loading…";
      case "error":
        return "Failed to load books";
      case "success":
        return this.books.length === 0 ? "No books yet" : "";
      default:
        return "";
    }
  }

  init = () => {
    void this.load();
  };

  dispose = () => {
    this.request?.abort();
    this.request = null;
    this.addBook.dispose();
  };

  setFilter = (filter: BooksFilter) => {
    if (filter === this.filter) {
      return;
    }
    this.filter = filter;
    this.books = [];
    void this.load();
  };

  private handleBookAdded = () => {
    void this.load();
    void this.privateBooksStore.refresh();
  };

  private load = async () => {
    this.request?.abort();
    const request = new AbortController();
    this.request = request;
    this.status = "loading";

    try {
      const books = await this.repository.getBooks(
        this.filter,
        request.signal
      );
      if (request.signal.aborted) {
        return;
      }
      runInAction(() => {
        this.books = books;
        this.status = "success";
      });
    } catch (error) {
      if (request.signal.aborted) {
        return;
      }
      console.debug("Failed to load books", error);
      runInAction(() => {
        this.status = "error";
      });
    }
  };
}
