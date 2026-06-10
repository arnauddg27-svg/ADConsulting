import { BigQuery } from "@google-cloud/bigquery";
import { existsSync } from "node:fs";

let cachedClient;

function parseInlineCredentials() {
  const raw =
    process.env.GOOGLE_SERVICE_ACCOUNT_KEY_JSON ||
    process.env.BIGQUERY_SERVICE_ACCOUNT_JSON ||
    process.env.GOOGLE_APPLICATION_CREDENTIALS_JSON;
  if (!raw) return null;

  const parsed = JSON.parse(raw);
  if (parsed.private_key) {
    parsed.private_key = parsed.private_key.replace(/\\n/g, "\n");
  }
  return parsed;
}

function credentialMode(credentials) {
  if (credentials) return "inline";

  const keyFile = process.env.GOOGLE_APPLICATION_CREDENTIALS;
  if (!keyFile) return "application-default";

  if (!existsSync(keyFile)) {
    if (process.env.VERCEL) {
      throw new Error(
        "BigQuery credentials are misconfigured for Vercel. " +
          "GOOGLE_APPLICATION_CREDENTIALS points to a local file path that is not available in production. " +
          "Set GOOGLE_SERVICE_ACCOUNT_KEY_JSON to the service account JSON contents, then redeploy."
      );
    }
    throw new Error(`GOOGLE_APPLICATION_CREDENTIALS points to a missing local file: ${keyFile}`);
  }

  return "file";
}

export function dashboardConfig() {
  const projectId = process.env.BIGQUERY_PROJECT_ID || process.env.GOOGLE_CLOUD_PROJECT;
  if (!projectId) {
    throw new Error("Missing BIGQUERY_PROJECT_ID or GOOGLE_CLOUD_PROJECT env var. Copy a client .env to next_dashboard/.env.local");
  }
  const martsDataset = process.env.BIGQUERY_MARTS_DATASET;
  const rawDataset = process.env.BIGQUERY_RAW_DATASET || (martsDataset ? martsDataset.replace(/_marts$/, "_raw") : null);
  if (!rawDataset) {
    throw new Error("Missing BIGQUERY_RAW_DATASET env var. Copy a client .env to next_dashboard/.env.local");
  }
  return {
    clientName: process.env.DASHBOARD_CLIENT_NAME || "Dashboard",
    projectId,
    dataset: martsDataset || rawDataset.replace(/_raw$/, "_marts"),
    rawDataset,
  };
}

export function createBigQueryClient() {
  if (cachedClient) return cachedClient;

  const config = dashboardConfig();
  const credentials = parseInlineCredentials();
  const mode = credentialMode(credentials);
  const options = {
    projectId: config.projectId,
  };

  if (credentials) {
    options.credentials = credentials;
  }

  if (process.env.NODE_ENV === "development") {
    console.log("[bigquery] client:", config.projectId, "| raw:", config.rawDataset, "| creds:", mode);
  }

  cachedClient = new BigQuery(options);
  return cachedClient;
}

export function fullyQualifiedTable(tableName) {
  const config = dashboardConfig();
  return `\`${config.projectId}.${config.dataset}.${tableName}\``;
}

export function rawTable(tableName) {
  const config = dashboardConfig();
  return `\`${config.projectId}.${config.rawDataset}.${tableName}\``;
}
