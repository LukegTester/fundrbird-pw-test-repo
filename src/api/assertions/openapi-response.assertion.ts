import { expect, type APIRequestContext } from "@playwright/test";
import OpenAPIResponseValidator, {
  type OpenAPIResponseValidatorArgs,
} from "openapi-response-validator";
import { loadOpenApiDocument } from "@src/api/openapi/openapi.loader";

type HttpMethod = "get" | "post" | "put" | "patch" | "delete";

type OpenApiResponseValidationOptions = {
  request: APIRequestContext;
  body: unknown;
  path: string;
  method: HttpMethod;
  statusCode: number;
  context: string;
};

export async function expectResponseMatchesOpenApi(
  options: OpenApiResponseValidationOptions,
): Promise<void> {
  const openApiDocument = await loadOpenApiDocument(options.request);

  const paths = openApiDocument.paths as Record<
    string,
    Record<string, unknown>
  >;
  const pathDefinition = paths[options.path];

  if (!pathDefinition) {
    throw new Error(
      `${options.context}: OpenAPI path '${options.path}' was not found`,
    );
  }

  const operation = pathDefinition[options.method] as
    | { responses?: Record<string, unknown> }
    | undefined;

  if (!operation?.responses) {
    throw new Error(
      `${options.context}: OpenAPI operation '${options.method.toUpperCase()} ${options.path}' was not found`,
    );
  }

  const validator = new OpenAPIResponseValidator({
    responses: operation.responses as OpenAPIResponseValidatorArgs["responses"],
    components: openApiDocument.components as
      | OpenAPIResponseValidatorArgs["components"]
      | undefined,
  });

  const validationError = validator.validateResponse(
    options.statusCode,
    options.body,
  );

  expect(
    validationError,
    `${options.context}: response does not match OpenAPI schema. ${JSON.stringify(
      validationError,
      null,
      2,
    )}`,
  ).toBeUndefined();
}
