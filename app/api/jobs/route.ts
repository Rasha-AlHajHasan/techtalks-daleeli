import { NextResponse } from "next/server";

const syndicateKeywords: Record<string, string> = {
  "نقابة الأطباء في بيروت": "doctor OR medical OR healthcare",
  "نقابة الفنانين المحترفين في لبنان": "artist OR designer OR creative",
  "نقابة المحامين المتدرجين": "lawyer OR legal OR paralegal",
  "نقابة المهندسين في لبنان": "engineer OR developer",
  "نقابة محرري الصحافة اللبنانية": "journalist OR editor OR writer",
  "Beirut Medical Syndicate": "doctor OR medical OR healthcare",
  "Syndicate of Professional Artists in Lebanon":
    "artist OR designer OR creative",
  "Trainee Lawyers Syndicate": "lawyer OR legal OR paralegal",
  "Syndicate of Engineers in Lebanon": "engineer OR developer",
  "Syndicate of Lebanese Press Editors": "journalist OR editor OR writer",
};

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const syndicateName = searchParams.get("syndicate");

  const uniqueKeywordsArray = Array.from(
    new Set(Object.values(syndicateKeywords)),
  );

  let queriesToRun: string[] = [];

  if (
    syndicateName &&
    syndicateName !== "all" &&
    syndicateKeywords[syndicateName]
  ) {
    queriesToRun = [syndicateKeywords[syndicateName]];
  } else {
    queriesToRun = uniqueKeywordsArray;
  }

  try {
    let allRawJobs: any[] = [];

    await Promise.all(
      queriesToRun.map(async (baseKeywordStr) => {
        const terms = baseKeywordStr.split(" OR ");
        const searchQuery = terms.map((term) => `${term} Lebanon`).join(" OR ");

        const url = `https://himalayas.app/jobs/api/search?q=${encodeURIComponent(
          searchQuery,
        )}&limit=50`;

        const response = await fetch(url, {
          headers: { "User-Agent": "DaleeliApp/1.0" },
        });

        if (response.ok) {
          const rawData = await response.json();
          if (rawData.jobs) {
            allRawJobs.push(...rawData.jobs);
          }
        }
      }),
    );

    const uniqueJobsMap = new Map();
    allRawJobs.forEach((job) => {
      const id = job.guid || job.companySlug + job.title;
      if (id && !uniqueJobsMap.has(id)) {
        uniqueJobsMap.set(id, job);
      }
    });
    const dedupedJobs = Array.from(uniqueJobsMap.values());

    const lebanonJobs = dedupedJobs.filter((job: any) => {
      const restrictions = job.locationRestrictions;
      if (
        restrictions &&
        Array.isArray(restrictions) &&
        restrictions.length > 0
      ) {
        return restrictions.some((loc: string) =>
          loc.toLowerCase().includes("lebanon"),
        );
      }
      return false;
    });

    const formattedJobs = lebanonJobs.map((job: any, index: number) => {
      let locationText = "Lebanon";
      if (job.locationRestrictions && job.locationRestrictions.length > 0) {
        const lebanonEntries = job.locationRestrictions.filter((loc: string) =>
          loc.toLowerCase().includes("lebanon"),
        );
        locationText = lebanonEntries.join(", ");
      }

      return {
        id: job.guid || `${job.companySlug}-${index}`,
        title: job.title || "Untitled",
        company: job.companyName || "Confidential",
        location: locationText,
        description: job.excerpt || "No description provided.",
        url:
          job.applicationLink ||
          `https://himalayas.app/companies/${job.companySlug}`,
      };
    });

    return NextResponse.json({ jobs: formattedJobs });
  } catch (error) {
    console.error("Himalayas API error:", error);
    return NextResponse.json(
      { error: "Failed to fetch jobs. Please try again later." },
      { status: 500 },
    );
  }
}
