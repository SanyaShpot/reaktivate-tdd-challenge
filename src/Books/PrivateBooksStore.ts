import { makeAutoObservable, runInAction } from "mobx";
import type { BooksRepository } from "./Books.repository";

export class PrivateBooksStore {
  count: number | null = null;

  private readonly repository: BooksRepository;

  constructor(repository: BooksRepository) {
    this.repository = repository;
    makeAutoObservable<PrivateBooksStore, "repository">(this, {
      repository: false,
    });
  }

  refresh = async () => {
    try {
      const books = await this.repository.getBooks("private");
      runInAction(() => {
        this.count = books.length;
      });
    } catch (error) {
      console.debug("Failed to load private books count", error);
    }
  };
}
