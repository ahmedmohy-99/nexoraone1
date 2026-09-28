import { createFileRoute, Outlet, redirect } from "@tanstack/react-router";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/_authenticated")({
  ssr: false,
  beforeLoad: async () => {
    const { data, error } = await supabase.auth.getUser();
    if (error || !data.user) throw redirect({ to: "/auth" });
    // ensure profile exists (assigns role on first creation)
    await supabase
      .from("profiles")
      .upsert(
        { id: data.user.id, full_name: (data.user.user_metadata?.["full_name"] as string) ?? null },
        { onConflict: "id", ignoreDuplicates: true },
      );
    return { user: data.user };
  },
  component: () => <Outlet />,
});
