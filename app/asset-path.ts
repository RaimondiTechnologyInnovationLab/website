/** Public assets must include the repository path when hosted on GitHub Pages. */
export function assetPath(path: string): string {
  return `${process.env.NEXT_PUBLIC_BASE_PATH ?? ""}${path}`;
}
