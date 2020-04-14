const KustoClient = require('azure-kusto-data').Client;
const KustoConnectionStringBuilder = require('azure-kusto-data').KustoConnectionStringBuilder;

const clusterName = process.env.ADX_CLUSTER_NAME;
const defaultDB = process.env.ADX_DATABASE_NAME;
const appId = process.env.ADX_CLIENT_ID;
const appKey = process.env.ADX_CLIENT_SECRET;
const authorityId = process.env.ADX_TENANT_ID;

const kcsb = KustoConnectionStringBuilder.withAadApplicationKeyAuthentication(
  `https://${clusterName}.kusto.windows.net`,
  appId,
  appKey,
  authorityId
);

const client = (exports.client = new KustoClient(kcsb));
