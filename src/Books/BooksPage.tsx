import { observer } from "mobx-react-lite";
import { SegmentedControl } from "../Shared/components/SegmentedControl";
import { useController } from "../Shared/hooks/useController";
import { AddBookForm } from "./AddBook/AddBookForm";
import { createBooksController } from "./Books.composition";

export const BooksPage = observer(() => {
  const controller = useController(createBooksController);

  return (
    <section className="books">
      <SegmentedControl options={controller.filterOptions} />
      <p role="status" className="books__status">
        {controller.message}
      </p>
      <ul className="books__list">
        {controller.items.map((item) => (
          <li key={item.key} className="books__item">
            {item.label}
          </li>
        ))}
      </ul>
      <AddBookForm controller={controller.addBook} />
    </section>
  );
});
