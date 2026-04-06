import type { NextApiRequest, NextApiResponse } from "next";

type LanguageImageSearchResponse =
  | {
      images: Array<{
        id: number;
        provider: "pixabay" | "unsplash";
        previewURL: string;
        webformatURL: string;
        tags: string;
      }>;
    }
  | { error: string };

type LanguageImageResult = Exclude<
  LanguageImageSearchResponse,
  { error: string }
>["images"][number];

function getQueryValue(value: string | string[] | undefined): string {
  if (Array.isArray(value)) {
    return value[0]?.trim() ?? "";
  }

  return value?.trim() ?? "";
}

function buildUnsplashPreviewUrl(baseUrl: string): string {
  const previewUrl = new URL(baseUrl);
  previewUrl.searchParams.set("w", "480");
  previewUrl.searchParams.set("h", "320");
  previewUrl.searchParams.set("crop", "entropy");
  previewUrl.searchParams.set("fm", "jpg");
  previewUrl.searchParams.set("auto", "format");
  previewUrl.searchParams.set("q", "80");
  previewUrl.searchParams.set("fit", "crop");
  previewUrl.searchParams.set("dpr", "1");

  return previewUrl.toString();
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<LanguageImageSearchResponse>,
) {
  const query = getQueryValue(req.query.q);

  if (!query) {
    res.status(400).json({
      error: "A search query is required.",
    });
    return;
  }

  if (!process.env.UNSPLASH_ACCESS_KEY?.trim()) {
    res.status(500).json({
      error: "Language image search is not configured.",
    });
    return;
  }

  try {
    const unsplashImages = await fetchUnsplashImages(query);
    if (unsplashImages && unsplashImages.length > 0) {
      res.status(200).json({
        images: unsplashImages,
      });
      return;
    }

    res.status(502).json({
      error: "Unable to fetch language images right now.",
    });
  } catch {
    res.status(502).json({
      error: "Unable to fetch language images right now.",
    });
  }
}

async function fetchUnsplashImages(
  query: string,
): Promise<LanguageImageResult[] | null> {
  const accessKey = process.env.UNSPLASH_ACCESS_KEY?.trim();
  if (!accessKey) return null;

  const searchUrl = new URL("https://api.unsplash.com/search/photos");
  searchUrl.searchParams.set("query", query);
  searchUrl.searchParams.set("page", "1");
  searchUrl.searchParams.set("per_page", "12");
  searchUrl.searchParams.set("orientation", "landscape");

  const response = await fetch(searchUrl.toString(), {
    headers: {
      Authorization: `Client-ID ${accessKey}`,
      "Accept-Version": "v1",
    },
  });
  if (!response.ok) return null;

  const payload = (await response.json()) as {
    results?: Array<{
      id?: string;
      alt_description?: string | null;
      description?: string | null;
      urls?: {
        raw?: string;
        small?: string;
        regular?: string;
      };
    }>;
  };

  return (payload.results ?? [])
    .filter(
      (image) =>
        typeof image.urls?.small === "string" &&
        typeof image.urls?.regular === "string",
    )
    .map((image, index) => ({
      id: index,
      provider: "unsplash" as const,
      previewURL: image.urls?.raw
        ? buildUnsplashPreviewUrl(image.urls.raw)
        : (image.urls?.small as string),
      webformatURL: image.urls?.regular as string,
      tags: image.alt_description?.trim() || image.description?.trim() || query,
    }));
}
