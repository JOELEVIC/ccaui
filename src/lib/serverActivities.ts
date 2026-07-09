// Server-side (no Apollo) fetch helpers for activities — used by generateMetadata,
// JSON-LD, and the sitemap, all of which run on the server and must produce real
// per-post <meta> tags so links preview richly on WhatsApp/Facebook/X and rank.

const GRAPHQL_URI =
  process.env.NEXT_PUBLIC_GRAPHQL_URI ??
  (process.env.NEXT_PUBLIC_VERCEL_ENV === "production"
    ? "https://api.dchessacademy.com/api/graphql"
    : "http://localhost:3000/api/graphql");

export interface ServerActivity {
  id: string;
  slug: string;
  type: string;
  title: string;
  excerpt: string | null;
  coverImageUrl: string | null;
  region: string | null;
  tags: string[];
  eventDate: string | null;
  publishedAt: string | null;
}

async function gqlFetch<T>(query: string, variables: Record<string, unknown>): Promise<T | null> {
  try {
    const res = await fetch(GRAPHQL_URI, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ query, variables }),
      // Revalidate periodically so published edits propagate without a redeploy.
      next: { revalidate: 300 },
    });
    if (!res.ok) return null;
    const json = (await res.json()) as { data?: T; errors?: unknown };
    if (json.errors) return null;
    return json.data ?? null;
  } catch {
    return null;
  }
}

export async function fetchActivityBySlug(slug: string): Promise<ServerActivity | null> {
  const data = await gqlFetch<{ activity: ServerActivity | null }>(
    `query A($slug:String!){activity(slug:$slug){id slug type title excerpt coverImageUrl region tags eventDate publishedAt}}`,
    { slug }
  );
  return data?.activity ?? null;
}

export async function fetchPublishedActivities(limit = 50): Promise<ServerActivity[]> {
  const data = await gqlFetch<{ activities: { items: ServerActivity[] } }>(
    `query F($limit:Int){activities(limit:$limit){items{id slug type title excerpt coverImageUrl region tags eventDate publishedAt}}}`,
    { limit }
  );
  return data?.activities.items ?? [];
}
