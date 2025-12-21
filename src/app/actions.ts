"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

export async function addDemoRecord(formData: FormData) {
  const name = formData.get("name") as string;
  if (!name) return;

  const supabase = await createClient();
  const { error } = await supabase.from("demo").insert([{ name }]);
  if (error) {
    console.error("Error adding record:", error);
    return;
  }

  revalidatePath("/");
}
