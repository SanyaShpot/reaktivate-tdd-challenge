export type BooksFilter = "all" | "private";

export interface BookDto {
  id?: number;
  name: string;
  author: string;
  ownerId?: string;
}

export interface AddBookResultDto {
  status: string;
}

export interface Book {
  name: string;
  author: string;
}
