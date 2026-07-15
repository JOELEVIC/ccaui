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
        photoCount
        highlights {
          id
          url
          thumbUrl
          width
          height
        }
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
      photoCount
      images {
        id
        url
        thumbUrl
        width
        height
        caption
      }
    }
  }
`;

export interface ActivityImage {
  id: string;
  url: string;
  thumbUrl: string | null;
  width: number | null;
  height: number | null;
  caption?: string | null;
}

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
  photoCount: number;
  highlights: ActivityImage[];
}

// The detail query selects `images` (full gallery) but not `highlights`.
export interface ActivityDetail extends Omit<ActivityListItem, "highlights"> {
  bodyJson: string | null;
  videoEmbedUrl: string | null;
  images: ActivityImage[];
}
