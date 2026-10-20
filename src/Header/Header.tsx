import { observer } from "mobx-react-lite";
import { useController } from "../Shared/hooks/useController";
import { createHeaderController } from "./Header.composition";

export const Header = observer(() => {
  const controller = useController(createHeaderController);

  return <header className="header">{controller.title}</header>;
});
