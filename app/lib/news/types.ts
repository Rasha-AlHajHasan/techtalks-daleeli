// app/lib/news/types.ts
export type ContentType =
  | "news"
  | "announcements"
  | "decisions"
  | "activities"
  | "circulars"
  | "events"
  | "membership_updates";

export type NewsItem = {
  id: string;
  title: string;
  summary: string | null;
  content: string | null;
  published_at: string | null;
  fetched_at: string;
  content_type: ContentType;
  source_url: string;
  image_url: string | null;
  syndicate: {
    id: string;
    name: string;
    slug: string;
    logo_url?: string | null;
  } | null;
};
