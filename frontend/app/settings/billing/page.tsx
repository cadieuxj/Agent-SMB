import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import BillingPageContent from "@/components/BillingPageContent";

export default async function BillingPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/");

  return <BillingPageContent userId={user.id} userEmail={user.email ?? ""} />;
}
