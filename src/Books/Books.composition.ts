import { ApiGateway } from "../Shared/ApiGateway";
import { HttpBooksRepository } from "./Books.repository";
import { BooksController } from "./BooksController";
import { PrivateBooksStore } from "./PrivateBooksStore";

const booksRepository = new HttpBooksRepository(new ApiGateway());

export const privateBooksStore = new PrivateBooksStore(booksRepository);

export const createBooksController = () =>
  new BooksController(booksRepository, privateBooksStore);
