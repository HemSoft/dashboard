"use server";

import { fetchAllNews } from "./lib/fetcher";
import type { FetchNewsResult } from "./types";

export async function fetchNews(): Promise<FetchNewsResult> {
  return fetchAllNews();
}
