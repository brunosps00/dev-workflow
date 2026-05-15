const fs = require('fs');
const path = require('path');
const { ensureDir } = require('./utils');
const { MCP_SERVERS } = require('./constants');

// Read .claude/settings.json (or return empty object if missing/malformed).
function readSettings(projectRoot) {
  const settingsPath = path.join(projectRoot, '.claude', 'settings.json');
  if (!fs.existsSync(settingsPath)) return {};
  try {
    return JSON.parse(fs.readFileSync(settingsPath, 'utf-8'));
  } catch {
    return {};
  }
}

// Write .claude/settings.json, ensuring directory exists and JSON ends with newline.
function writeSettings(projectRoot, settings) {
  const settingsPath = path.join(projectRoot, '.claude', 'settings.json');
  ensureDir(path.dirname(settingsPath));
  fs.writeFileSync(settingsPath, JSON.stringify(settings, null, 2) + '\n', 'utf-8');
}

// Upsert a single MCP server entry into .claude/settings.json. Returns "added" or
// "skipped". Existing entries are NEVER overwritten — the user's config wins.
// Shared by installMCPs (default init/update) and install-azure-skills.
function addMcpServer(projectRoot, name, config) {
  const settings = readSettings(projectRoot);
  if (!settings.mcpServers) settings.mcpServers = {};
  if (settings.mcpServers[name]) {
    return 'skipped';
  }
  settings.mcpServers[name] = config;
  writeSettings(projectRoot, settings);
  return 'added';
}

function installMCPs(projectRoot) {
  let added = 0;
  let skipped = 0;

  for (const [name, config] of Object.entries(MCP_SERVERS)) {
    const status = addMcpServer(projectRoot, name, config);
    if (status === 'added') added++;
    else skipped++;
  }

  return { added, skipped };
}

module.exports = { installMCPs, addMcpServer, readSettings, writeSettings };
