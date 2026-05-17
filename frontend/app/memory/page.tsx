import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import MemoryPageContent from "@/components/MemoryPageContent";

export default async function MemoryPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/");

  return <MemoryPageContent userId={user.id} userEmail={user.email ?? ""} />;
}
