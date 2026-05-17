import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import SettingsPageContent from "@/components/SettingsPageContent";

export default async function SettingsPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/");

  return <SettingsPageContent userId={user.id} userEmail={user.email ?? ""} />;
}
