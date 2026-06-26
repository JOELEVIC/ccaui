import type { Metadata } from "next";
import { CommunityArticle } from "@/components/community/CommunityArticle";
import { fetchActivityBySlug } from "@/lib/serverActivities";
import { activityJsonLd } from "@/lib/community/jsonld";

// Server component: emits real per-post <meta>/OpenGraph/Twitter tags + JSON-LD
// so the link previews richly when shared and is indexable. The visual render
// is delegated to the client <CommunityArticle/>.

export async function generateMetadata({ params }: { params: { slug: string } }): Promise<Metadata> {
  const a = await fetchActivityBySlug(params.slug);
  if (!a) {
    return { title: "Community", description: "From the chess community across Cameroon." };
  }
  const description = a.excerpt ?? "From the chess community across Cameroon.";
  const path = `/community/${a.slug}`;
  const images = a.coverImageUrl ? [{ url: a.coverImageUrl, width: 1200, height: 630, alt: a.title }] : undefined;
  return {
    title: a.title,
    description,
    keywords: a.tags?.length ? a.tags : undefined,
    alternates: { canonical: path },
    openGraph: {
      type: "article",
      title: a.title,
      description,
      url: path,
      images,
      publishedTime: a.publishedAt ?? undefined,
      tags: a.tags ?? undefined,
    },
    twitter: {
      card: "summary_large_image",
      title: a.title,
      description,
      images: a.coverImageUrl ? [a.coverImageUrl] : undefined,
    },
  };
}

export default async function ActivityDetailPage({ params }: { params: { slug: string } }) {
  const a = await fetchActivityBySlug(params.slug);
  return (
    <>
      {a ? (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(activityJsonLd(a)) }}
        />
      ) : null}
      <CommunityArticle slug={params.slug} basePath="/community" />
    </>
  );
}
