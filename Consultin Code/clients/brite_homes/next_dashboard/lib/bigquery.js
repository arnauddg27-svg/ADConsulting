import { BigQuery } from "@google-cloud/bigquery";

let cachedClient;

function parseInlineCredentials() {
  const raw = process.env.GOOGLE_SERVICE_ACCOUNT_KEY_JSON;
  if (!raw) return null;

  const parsed = JSON.parse(raw);
  if (parsed.private_key) {
    parsed.private_key = parsed.private_key.replace(/\\n/g, "\n");
  }
  return parsed;
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
  const options = {
    projectId: config.projectId,
    scopes: [
      "https://www.googleapis.com/auth/bigquery",
      "https://www.googleapis.com/auth/drive.readonly",
    ],
  };

  if (credentials) {
    options.credentials = credentials;
  }

  if (process.env.NODE_ENV === "development") {
    console.log("[bigquery] client:", config.projectId, "| raw:", config.rawDataset, "| creds:", credentials ? "inline" : process.env.GOOGLE_APPLICATION_CREDENTIALS ? "file" : "NONE");
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

export function stagingTable(tableName) {
  const config = dashboardConfig();
  const stagingDataset = config.rawDataset.replace(/_raw$/, "_staging");
  return `\`${config.projectId}.${stagingDataset}.${tableName}\``;
}
