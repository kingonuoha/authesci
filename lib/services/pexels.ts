"use server";

import { createClient } from "pexels";

const PEXELS_API_KEY = process.env.PEXELS_API_KEY;

function getClient() {
  if (!PEXELS_API_KEY) {
    console.warn("PEXELS_API_KEY is not set");
    return null;
  }
  return createClient(PEXELS_API_KEY);
}

export async function searchPhotos(query: string, perPage: number = 5) {
  const client = getClient();
  if (!client) return [];

  try {
    const result = await client.photos.search({ query, per_page: perPage });
    if ("photos" in result) {
      return result.photos;
    }
    return [];
  } catch (error) {
    console.error("Error fetching photos from Pexels:", error);
    return [];
  }
}

export async function getCuratedPhotos(perPage: number = 5) {
  const client = getClient();
  if (!client) return [];

  try {
      const result = await client.photos.curated({ per_page: perPage });
      if ("photos" in result) {
          return result.photos;
      }
      return [];
  } catch (error) {
      console.error("Error fetching curated photos from Pexels:", error);
      return [];
  }
}


