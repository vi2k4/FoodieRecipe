export class PaginationResponseDto<T> {
  data: T[] = [];
  page = 1;
  limit = 10;
  total = 0;
}
