import { supabase } from "./utils/supabase/client";

export default async function Page() {
  const { data, error } = await supabase.from("test").select("*");

  console.log("DATA:", data);
  console.log("ERROR:", error);

  return (
    <div>
      <h1>Check console</h1>
    </div>
  );
}
