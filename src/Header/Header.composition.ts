import { privateBooksStore } from "../Books/Books.composition";
import { HeaderController } from "./HeaderController";

export const createHeaderController = () =>
  new HeaderController(privateBooksStore);
