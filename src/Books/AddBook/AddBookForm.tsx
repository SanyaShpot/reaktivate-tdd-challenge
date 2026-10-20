import { observer } from "mobx-react-lite";
import { TextInput } from "../../Shared/components/TextInput";
import type { AddBookController } from "./AddBookController";

interface AddBookFormProps {
  controller: AddBookController;
}

export const AddBookForm = observer(({ controller }: AddBookFormProps) => (
  <div className="add-book">
    <TextInput
      value={controller.name}
      placeholder="Name"
      onChange={controller.setName}
    />
    <TextInput
      value={controller.author}
      placeholder="Author"
      onChange={controller.setAuthor}
    />
    <button
      type="button"
      disabled={!controller.canSubmit}
      onClick={controller.submit}
    >
      {controller.submitLabel}
    </button>
    <p role="alert" className="error">
      {controller.errorMessage}
    </p>
  </div>
));
