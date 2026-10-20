import { describe, expect, it, vi } from "vitest";
import { createBooksRepositoryMock } from "../Books.testUtils";
import { AddBookController } from "./AddBookController";

const setup = () => {
  const repository = createBooksRepositoryMock();
  const onAdded = vi.fn();
  const controller = new AddBookController(repository, onAdded);
  return { repository, onAdded, controller };
};

const fillForm = (controller: AddBookController) => {
  controller.setName("  Dune ");
  controller.setAuthor(" Frank Herbert  ");
};

describe("AddBookController", () => {
  it("cannot submit while a field is empty or blank", () => {
    const { controller } = setup();

    expect(controller.canSubmit).toBe(false);
    controller.setName("Dune");
    expect(controller.canSubmit).toBe(false);
    controller.setAuthor("   ");
    expect(controller.canSubmit).toBe(false);
    controller.setAuthor("Frank Herbert");
    expect(controller.canSubmit).toBe(true);
  });

  it("does not call the repository when the form is invalid", async () => {
    const { controller, repository } = setup();

    await controller.submit();

    expect(repository.addBook).not.toHaveBeenCalled();
  });

  it("submits trimmed values, clears the form and notifies on success", async () => {
    const { controller, repository, onAdded } = setup();
    fillForm(controller);

    await controller.submit();

    expect(repository.addBook).toHaveBeenCalledWith(
      { name: "Dune", author: "Frank Herbert" },
      expect.any(AbortSignal)
    );
    expect(controller.name).toBe("");
    expect(controller.author).toBe("");
    expect(controller.errorMessage).toBe("");
    expect(onAdded).toHaveBeenCalledOnce();
  });

  it("shows a busy state while submitting", async () => {
    const { controller, repository } = setup();
    repository.addBook.mockReturnValue(new Promise(() => {}));
    fillForm(controller);

    void controller.submit();

    expect(controller.isSubmitting).toBe(true);
    expect(controller.submitLabel).toBe("Adding…");
    expect(controller.canSubmit).toBe(false);
  });

  it("keeps the input and shows an error when the API rejects the book", async () => {
    const { controller, repository, onAdded } = setup();
    repository.addBook.mockResolvedValue(false);
    fillForm(controller);

    await controller.submit();

    expect(controller.errorMessage).not.toBe("");
    expect(controller.name).toBe("  Dune ");
    expect(controller.isSubmitting).toBe(false);
    expect(onAdded).not.toHaveBeenCalled();
  });

  it("shows an error when the request fails", async () => {
    vi.spyOn(console, "debug").mockImplementation(() => {});
    const { controller, repository, onAdded } = setup();
    repository.addBook.mockRejectedValue(new Error("offline"));
    fillForm(controller);

    await controller.submit();

    expect(controller.errorMessage).not.toBe("");
    expect(controller.isSubmitting).toBe(false);
    expect(onAdded).not.toHaveBeenCalled();
  });

  it("aborts the pending request on dispose", () => {
    const { controller, repository } = setup();
    repository.addBook.mockReturnValue(new Promise(() => {}));
    fillForm(controller);
    void controller.submit();
    const signal = repository.addBook.mock.calls[0][1];

    controller.dispose();

    expect(signal?.aborted).toBe(true);
  });
});
