import type { APIRequestContext } from "@playwright/test";
import { OPENAPI_URL } from "@config/env.config";

export type OpenApiDocument = Record<string, unknown>;

let cachedOpenApiDocument: OpenApiDocument | null = null;

export async function loadOpenApiDocument(
  request: APIRequestContext,
): Promise<OpenApiDocument> {
  if (cachedOpenApiDocument) {
    return cachedOpenApiDocument;
  }

  const response = await request.get(OPENAPI_URL);

  if (!response.ok()) {
    throw new Error(
      `Failed to load OpenAPI document. Expected 200, received ${response.status()}`,
    );
  }

  cachedOpenApiDocument = (await response.json()) as OpenApiDocument;

  return cachedOpenApiDocument;
}
