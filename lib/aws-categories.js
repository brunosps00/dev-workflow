// Upstream-native categories for the AWS skills repo (aws/agent-toolkit-for-aws,
// Apache 2.0). Microsoft's Azure repo is service-oriented and required us to invent
// 10 human categories; AWS organizes skills task-oriented under skills/core-skills/
// (13 horizontal) and skills/specialized-skills/<category>/ (9 verticals × N tasks).
// This file mirrors that structure 1:1 — no artificial mapping.
//
// Update this file when the upstream adds, renames, or removes top-level directories.

const CATEGORIES = {
  All: {
    description: 'Every skill in the upstream repo (core + specialized).',
    dirs: '__ALL__',
  },
  Core: {
    description:
      'All 13 horizontal core skills (Bedrock, Amplify, Billing, CDK, CloudFormation, Containers, IAM, Messaging, Observability, SDK JS/Python/Swift, Serverless).',
    dirs: ['core-skills/*'],
  },
  Analytics: {
    description: 'Athena, Glue, Kinesis, EMR, Redshift, OpenSearch, QuickSight, etc.',
    dirs: ['specialized-skills/analytics-skills/*'],
  },
  Database: {
    description: 'DynamoDB, RDS/Aurora, DocumentDB, ElastiCache, Neptune, etc.',
    dirs: ['specialized-skills/database-skills/*'],
  },
  'EC2 / Compute': {
    description: 'EC2 launch, AMI, instance profiles, image builder, etc.',
    dirs: ['specialized-skills/ec2-skills/*'],
  },
  'Migration & Modernization': {
    description: 'DMS, MGN, App2Container, modernization patterns.',
    dirs: ['specialized-skills/migration-and-modernization-skills/*'],
  },
  'Networking & Content Delivery': {
    description: 'VPC, Route 53, CloudFront, API Gateway, ELB, Transit Gateway, etc.',
    dirs: ['specialized-skills/networking-and-content-delivery-skills/*'],
  },
  Operations: {
    description: 'CloudWatch, Systems Manager, OpsWorks, Config, Trusted Advisor.',
    dirs: ['specialized-skills/operations-skills/*'],
  },
  'Security & Identity': {
    description: 'IAM patterns, KMS, Secrets Manager, GuardDuty, WAF, Security Hub.',
    dirs: ['specialized-skills/security-and-identity-skills/*'],
  },
  Serverless: {
    description: 'Lambda, Step Functions, EventBridge, SAM patterns.',
    dirs: ['specialized-skills/serverless-skills/*'],
  },
  Storage: {
    description: 'S3, EBS, EFS, FSx, Storage Gateway, data lake tables.',
    dirs: ['specialized-skills/storage-skills/*'],
  },
};

function listCategories() {
  return Object.keys(CATEGORIES);
}

// Resolve selected category names → list of upstream relative paths to scan for skills.
// Each entry is a directory pattern under `skills/`. The caller globs each pattern.
// Special-cases "All" → returns the sentinel string '__ALL__' meaning every dir
// under skills/core-skills/ and skills/specialized-skills/<*>/.
function resolveDirs(selectedCategories) {
  if (selectedCategories.includes('All')) {
    return '__ALL__';
  }
  const dirs = new Set();
  for (const cat of selectedCategories) {
    const entry = CATEGORIES[cat];
    if (!entry || !Array.isArray(entry.dirs)) continue;
    for (const d of entry.dirs) {
      dirs.add(d);
    }
  }
  return Array.from(dirs);
}

module.exports = { CATEGORIES, listCategories, resolveDirs };
