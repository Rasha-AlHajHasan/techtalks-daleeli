import PageUI from "./pageUI";
import { getLocale } from "next-intl/server";

export type BackendSyndicate = {
  id: string;
  name: string;
  slug: string;
  description_ar: string | null;
  sector?: string;
};

export default async function SyndicatesPage() {
  const locale = await getLocale();
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";

  let backendData: BackendSyndicate[] = [];

  try {
    const res = await fetch(`${baseUrl}/api/syndicates?locale=${locale}`, {
      cache: "no-store",
    });

    if (res.ok) {
      const data = await res.json();
      backendData = data.syndicates || [];
    } else {
      console.error("API returned an error status:", res.status);
    }
  } catch (error) {
    console.error("Error fetching syndicates from API:", error);
  }

  return <PageUI initialData={backendData} />;
}
