"use server";

import { revalidatePath } from "next/cache";
import { fetchAllNews } from "./lib/fetcher";
import type { FetchNewsResult } from "./types";

export async function fetchNews(): Promise<FetchNewsResult> {
  return fetchAllNews();
}

export async function revalidateNews(): Promise<void> {
  revalidatePath("/news");
}
