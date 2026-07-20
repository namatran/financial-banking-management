import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";

const DashboardPage = async() =>  {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

    // FIX: If the layout hasn't redirected yet, stop this page from crashing
  if (!user) {
    redirect("/auth/login");
  }

  // Example: read the synced profile row (see profiles migration).
  const { data: profile } = await supabase
    .from("profiles")
    .select("full_name")
    .eq("id", user.id)
    .single();

  return (
    <div>
      <h1 className="text-xl font-semibold">
        Welcome{profile?.full_name ? `, ${profile.full_name}` : ""}
      </h1>
      <p className="mt-2 text-sm text-neutral-500">
        This page is only reachable with a valid session.
      </p>
    </div>
  );
}

export default DashboardPage