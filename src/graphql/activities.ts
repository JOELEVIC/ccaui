import { gql } from "@apollo/client";

export const ACTIVITIES_FEED = gql`
  query ActivitiesFeed($type: ActivityType, $region: String, $limit: Int, $offset: Int) {
    activities(type: $type, region: $region, limit: $limit, offset: $offset) {
      total
      items {
        id
        slug
        type
        title
        excerpt
        coverImageUrl
        region
        tags
        featured
        eventDate
        publishedAt
      }
    }
  }
`;

export const ACTIVITY_BY_SLUG = gql`
  query ActivityBySlug($slug: String!) {
    activity(slug: $slug) {
      id
      slug
      type
      title
      excerpt
      bodyJson
      coverImageUrl
      videoEmbedUrl
      region
      tags
      featured
      eventDate
      publishedAt
      images {
        id
        url
        caption
      }
    }
  }
`;

export interface ActivityListItem {
  id: string;
  slug: string;
  type: string;
  title: string;
  excerpt: string | null;
  coverImageUrl: string | null;
  region: string | null;
  tags: string[];
  featured: boolean;
  eventDate: string | null;
  publishedAt: string | null;
}

export interface ActivityDetail extends ActivityListItem {
  bodyJson: string | null;
  videoEmbedUrl: string | null;
  images: { id: string; url: string; caption: string | null }[];
}
