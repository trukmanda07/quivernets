/**
 * Mock for astro:content module
 * This allows us to test content collection functionality in Vitest
 */

import { glob } from 'glob';
import path from 'path';
import fs from 'fs';
import matter from 'gray-matter';

export interface CollectionEntry<T = any> {
  id: string;
  slug: string;
  body: string;
  collection: string;
  data: T;
}

/**
 * Mock getCollection function that reads actual content files
 */
export async function getCollection(
  collectionName: string,
  filter?: (entry: CollectionEntry) => boolean
): Promise<CollectionEntry[]> {
  const contentDir = path.join(process.cwd(), 'src', 'content', collectionName);

  // Check if directory exists
  if (!fs.existsSync(contentDir)) {
    console.warn(`Collection "${collectionName}" does not exist or is empty.`);
    return [];
  }

  // Find all .md and .mdx files
  const pattern = path.join(contentDir, '**/*.{md,mdx}');
  const files = await glob(pattern, { nodir: true });

  // Parse each file
  const entries: CollectionEntry[] = files.map((filePath) => {
    const fileContent = fs.readFileSync(filePath, 'utf-8');
    const { data, content } = matter(fileContent);

    const relativePath = path.relative(contentDir, filePath);
    const slug = relativePath.replace(/\.(md|mdx)$/, '').replace(/\\/g, '/');

    return {
      id: slug,
      slug: slug,
      body: content,
      collection: collectionName,
      data: {
        ...data,
        pubDate: data.pubDate ? new Date(data.pubDate) : new Date(),
        draft: data.draft ?? false,
        hasMath: data.hasMath ?? false,
        hasCode: data.hasCode ?? false,
        featured: data.featured ?? false,
      },
    };
  });

  // Apply filter if provided
  if (filter) {
    return entries.filter(filter);
  }

  return entries;
}
