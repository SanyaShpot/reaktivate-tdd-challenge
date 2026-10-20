import { makeAutoObservable } from "mobx";
import type { PrivateBooksStore } from "../Books/PrivateBooksStore";
import type { Controller } from "../Shared/hooks/useController";

export class HeaderController implements Controller {
  private readonly privateBooksStore: PrivateBooksStore;

  constructor(privateBooksStore: PrivateBooksStore) {
    this.privateBooksStore = privateBooksStore;
    makeAutoObservable<HeaderController, "privateBooksStore">(this, {
      privateBooksStore: false,
    });
  }

  get title() {
    return `Your books: ${this.privateBooksStore.count ?? "…"}`;
  }

  init = () => {
    void this.privateBooksStore.refresh();
  };
}
