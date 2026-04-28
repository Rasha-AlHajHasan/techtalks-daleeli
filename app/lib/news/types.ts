export type ContentType =
  | "news"
  | "announcements"
  | "decisions"
  | "activities"
  | "circulars"
  | "events"
  | "membership_updates";

export interface Syndicate {
  id: string;
  name: string;
  slug?: string;
}
export interface NewsCategory {
  id: string;
  name: string;
}
export interface NewsItem {
  id: string;
  title: string;
  summary?: string;
  content?: string;

  image_url?: string;
  source_url?: string;

  published_at?: string;
  fetched_at?: string;

  content_type: ContentType;

  syndicate_id?: string;
  syndicate?: Syndicate;
}