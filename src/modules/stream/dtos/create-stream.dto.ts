export class CreateStreamDto {
  title: string;
  categoryId: string;
  streamKey: string;
  serverUrl: string;
  tagIds?: string[];
}
