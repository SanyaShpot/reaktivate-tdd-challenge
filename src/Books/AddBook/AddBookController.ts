import { makeAutoObservable, runInAction } from "mobx";
import type { BooksRepository } from "../Books.repository";

export class AddBookController {
  name = "";
  author = "";
  isSubmitting = false;
  hasError = false;

  private readonly repository: BooksRepository;
  private readonly onAdded: () => void;
  private request: AbortController | null = null;

  constructor(repository: BooksRepository, onAdded: () => void) {
    this.repository = repository;
    this.onAdded = onAdded;
    makeAutoObservable<AddBookController, "repository" | "onAdded" | "request">(
      this,
      { repository: false, onAdded: false, request: false }
    );
  }

  get canSubmit() {
    return !this.isSubmitting && this.name.trim() !== "" && this.author.trim() !== "";
  }

  get submitLabel() {
    return this.isSubmitting ? "Adding…" : "Add";
  }

  get errorMessage() {
    return this.hasError ? "Failed to add the book" : "";
  }

  dispose = () => {
    this.request?.abort();
    this.request = null;
  };

  setName = (name: string) => {
    this.name = name;
  };

  setAuthor = (author: string) => {
    this.author = author;
  };

  submit = async () => {
    if (!this.canSubmit) {
      return;
    }

    const request = new AbortController();
    this.request = request;
    this.isSubmitting = true;
    this.hasError = false;

    try {
      const isAdded = await this.repository.addBook(
        { name: this.name.trim(), author: this.author.trim() },
        request.signal
      );
      runInAction(() => {
        this.isSubmitting = false;
        this.hasError = !isAdded;
        if (isAdded) {
          this.name = "";
          this.author = "";
        }
      });
      if (isAdded) {
        this.onAdded();
      }
    } catch (error) {
      if (request.signal.aborted) {
        return;
      }
      console.debug("Failed to add book", error);
      runInAction(() => {
        this.isSubmitting = false;
        this.hasError = true;
      });
    }
  };
}
