const path = require("path");

/** @type {import('next').NextConfig} */
const nextConfig = {
  allowedDevOrigins: ["127.0.0.1"],
  outputFileTracingRoot: path.join(__dirname),
  // Treat @google-cloud/bigquery (and friends) as external runtime requires rather than
  // bundling them — required for the BigQuery SDK to load its native gRPC/protobuf pieces
  // correctly inside Next's compiled serverless output on Vercel.
  serverExternalPackages: [
    "@google-cloud/bigquery",
    "google-auth-library",
    "google-gax",
    "@grpc/grpc-js",
    "@grpc/proto-loader",
    "protobufjs",
  ],
  // NOTE: do NOT add outputFileTracingExcludes for @google-cloud/* — excluding those
  // folders ships the function without the package, causing a runtime "Cannot find module
  // '@google-cloud/bigquery'" 500. The serverless function needs those node_modules.
  staticPageGenerationTimeout: 180,
};

module.exports = nextConfig;
