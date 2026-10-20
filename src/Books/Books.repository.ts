import type { HttpGateway } from "../Shared/ApiGateway";
import type {
  AddBookResultDto,
  Book,
  BookDto,
  BooksFilter,
} from "./Books.types";

export interface BooksRepository {
  getBooks: (filter: BooksFilter, signal?: AbortSignal) => Promise<Book[]>;
  addBook: (book: Book, signal?: AbortSignal) => Promise<boolean>;
}

const PATH_BY_FILTER: Record<BooksFilter, string> = {
  all: "/",
  private: "/private",
};

export class HttpBooksRepository implements BooksRepository {
  private readonly gateway: HttpGateway;

  constructor(gateway: HttpGateway) {
    this.gateway = gateway;
  }

  getBooks = async (
    filter: BooksFilter,
    signal?: AbortSignal
  ): Promise<Book[]> => {
    const booksDto = await this.gateway.get<BookDto[]>(
      PATH_BY_FILTER[filter],
      signal
    );
    return booksDto.map(({ name, author }) => ({ name, author }));
  };

  addBook = async ({ name, author }: Book, signal?: AbortSignal) => {
    const resultDto = await this.gateway.post<AddBookResultDto>(
      "/",
      { name, author },
      signal
    );
    return resultDto.status === "ok";
  };
}
