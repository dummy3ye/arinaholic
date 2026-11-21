export function formatAuthors(authors: string[]): string {
  if (authors.length === 0) return "sage";
  if (authors.length === 1) return authors[0];
  if (authors.length === 2) return `${authors[0]} and ${authors[1]}`;
  return `${authors.slice(0, -1).join(", ")} and ${authors[authors.length - 1]}`;
}
