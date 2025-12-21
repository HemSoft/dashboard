"use server";

import { getNewsItems } from "./data";
import type { NewsItem } from "./types";

export async function fetchNews(): Promise<NewsItem[]> {
  return getNewsItems();
}
