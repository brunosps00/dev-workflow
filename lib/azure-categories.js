// Curated categories mapping human-readable groups to upstream Azure skill slugs
// from MicrosoftDocs/Agent-Skills (CC-BY-4.0). Match is prefix-based: a slug in the
// list matches any directory whose name starts with that slug. "all" is a sentinel
// meaning every directory under skills/.
//
// This file is the single source of truth. When Microsoft adds, renames, or removes
// services, update the prefixes here — install-azure-skills.js does not embed slugs.

const CATEGORIES = {
  All: { description: 'Every skill in the upstream repo (skills/ and non-overlapping products/).' },
  Compute: {
    description: 'AKS, App Service, Container Apps/Instances/Registry, Functions, VMs, Batch.',
    prefixes: [
      'azure-aks',
      'azure-app-service',
      'azure-container-apps',
      'azure-container-instances',
      'azure-container-registry',
      'azure-functions',
      'azure-virtual-machines',
      'azure-vmware-solution',
      'azure-batch',
      'azure-spring-apps',
    ],
  },
  'Data & Storage': {
    description: 'Blob, Cosmos DB, SQL, MySQL, PostgreSQL, Cache for Redis, Data Lake, Files.',
    prefixes: [
      'azure-blob-storage',
      'azure-cosmos-db',
      'azure-sql',
      'azure-database-for-mysql',
      'azure-database-for-postgresql',
      'azure-cache-redis',
      'azure-data-lake',
      'azure-files',
      'azure-storage',
      'azure-table-storage',
      'azure-queue-storage',
      'azure-managed-disk',
    ],
  },
  'AI & ML': {
    description: 'OpenAI, AI Foundry, AI Vision, AI Search, Machine Learning, Anomaly Detector, Bot Service.',
    prefixes: [
      'azure-openai',
      'azure-ai-foundry',
      'azure-ai-vision',
      'azure-ai-search',
      'azure-ai-services',
      'azure-machine-learning',
      'azure-anomaly-detector',
      'azure-bot-service',
      'azure-cognitive',
    ],
  },
  Networking: {
    description: 'Application Gateway, Front Door, Load Balancer, VPN Gateway, ExpressRoute, Bastion, DNS, CDN.',
    prefixes: [
      'azure-application-gateway',
      'azure-front-door',
      'azure-load-balancer',
      'azure-vpn-gateway',
      'azure-expressroute',
      'azure-bastion',
      'azure-dns',
      'azure-cdn',
      'azure-virtual-network',
      'azure-virtual-wan',
      'azure-private-link',
      'azure-network-watcher',
      'azure-firewall',
      'azure-traffic-manager',
    ],
  },
  'Identity & Security': {
    description: 'Entra ID (Active Directory), Key Vault, Attestation, Defender, Sentinel.',
    prefixes: [
      'azure-active-directory',
      'azure-entra',
      'azure-key-vault',
      'azure-attestation',
      'azure-defender',
      'azure-sentinel',
      'azure-security-center',
      'azure-artifact-signing',
    ],
  },
  DevOps: {
    description: 'Azure DevOps (Boards, Pipelines, Artifacts, Repos), Azure DevOps Server, GitHub integration.',
    prefixes: [
      'azure-boards',
      'azure-pipelines',
      'azure-artifacts',
      'azure-repos',
      'azure-devops',
      'azure-test-plans',
    ],
  },
  Observability: {
    description: 'Monitor, Application Insights, Log Analytics.',
    prefixes: [
      'azure-monitor',
      'azure-application-insights',
      'azure-log-analytics',
    ],
  },
  Integration: {
    description: 'Logic Apps, Service Bus, Event Grid, Event Hubs, API Management, API Center.',
    prefixes: [
      'azure-logic-apps',
      'azure-service-bus',
      'azure-event-grid',
      'azure-event-hubs',
      'azure-api-management',
      'azure-api-center',
      'azure-business-process-tracking',
    ],
  },
  Architecture: {
    description: 'Architecture guidance, Advisor, Blueprints, Well-Architected.',
    prefixes: [
      'azure-architecture',
      'azure-advisor',
      'azure-blueprints',
      'azure-well-architected',
      'azure-policy',
      'azure-resource-graph',
      'azure-resource-manager',
    ],
  },
};

// Return the list of category names in the canonical display order.
function listCategories() {
  return Object.keys(CATEGORIES);
}

// Resolve selected category names → flat set of slug prefixes to match against
// upstream skill directory names. Special-cases "All".
function resolvePrefixes(selectedCategories) {
  if (selectedCategories.includes('All')) {
    return null; // null = match every directory
  }
  const prefixes = new Set();
  for (const cat of selectedCategories) {
    const entry = CATEGORIES[cat];
    if (!entry || !entry.prefixes) continue;
    for (const prefix of entry.prefixes) {
      prefixes.add(prefix);
    }
  }
  return Array.from(prefixes);
}

// True when a directory name should be installed given the resolved prefix set.
// null prefix set means install everything.
function matchesPrefixes(dirName, prefixes) {
  if (prefixes === null) return true;
  for (const prefix of prefixes) {
    if (dirName === prefix || dirName.startsWith(`${prefix}-`)) {
      return true;
    }
  }
  return false;
}

module.exports = { CATEGORIES, listCategories, resolvePrefixes, matchesPrefixes };
