#!/usr/bin/env node

/**
 * Build script for oh-my-opencode-slim configuration.
 *
 * Reads .opencode/oh-my-opencode-slim.source.jsonc (JSONC format),
 * resolves promptPath/orchestratorPromptPath to inline strings,
 * and writes .opencode/oh-my-opencode-slim.json.
 *
 * Supports --check mode: compares in-memory output to current runtime file
 * and exits non-zero if they differ.
 *
 * Zero external dependencies. JSONC parsing uses a string-aware state machine
 * to strip comments and trailing commas before passing to JSON.parse.
 */

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

// ── Paths ──────────────────────────────────────────────────────────────
const __filename = fileURLToPath(import.meta.url);
const REPO_ROOT = path.resolve(path.dirname(__filename), '../..');
const SOURCE_FILE = path.join(REPO_ROOT, '.opencode/oh-my-opencode-slim.source.jsonc');
const RUNTIME_FILE = path.join(REPO_ROOT, '.opencode/oh-my-opencode-slim.json');

// ── JSONC parser ───────────────────────────────────────────────────────
// Parses JSONC (JSON with comments and trailing commas) without dependencies.
// Uses a character-level state machine to distinguish strings from comments.
function parseJSONC(text) {
  const chars = [...text];
  const out = [];
  let i = 0;
  const len = chars.length;

  while (i < len) {
    const ch = chars[i];

    // ── String literal ──────────────────────────────────────────────
    if (ch === '"') {
      out.push(ch);
      i++;
      while (i < len) {
        const sc = chars[i];
        out.push(sc);
        if (sc === '\\') {
          // Escape sequence: skip next char
          i++;
          if (i < len) {
            out.push(chars[i]);
            i++;
          }
          continue;
        }
        if (sc === '"') {
          i++;
          break;
        }
        i++;
      }
      continue;
    }

    // ── Template literal (backtick string) ──────────────────────────
    if (ch === '`') {
      out.push(ch);
      i++;
      while (i < len) {
        const sc = chars[i];
        out.push(sc);
        if (sc === '\\') {
          i++;
          if (i < len) {
            out.push(chars[i]);
            i++;
          }
          continue;
        }
        if (sc === '`') {
          i++;
          break;
        }
        i++;
      }
      continue;
    }

    // ── Single-line comment // ──────────────────────────────────────
    if (ch === '/' && i + 1 < len && chars[i + 1] === '/') {
      // Skip until newline
      i += 2;
      while (i < len && chars[i] !== '\n') {
        i++;
      }
      continue;
    }

    // ── Block comment /* */ ─────────────────────────────────────────
    if (ch === '/' && i + 1 < len && chars[i + 1] === '*') {
      i += 2;
      while (i + 1 < len && !(chars[i] === '*' && chars[i + 1] === '/')) {
        i++;
      }
      i += 2; // skip */
      continue;
    }

    out.push(ch);
    i++;
  }

  let cleaned = out.join('');

  // ── Remove trailing commas before } and ] ─────────────────────────
  cleaned = cleaned.replace(/,(\s*[\}\]])/g, '$1');

  // ── Parse ─────────────────────────────────────────────────────────
  try {
    return JSON.parse(cleaned);
  } catch (err) {
    // Show context around error position
    const match = err.message.match(/position (\d+)/);
    if (match) {
      const pos = parseInt(match[1], 10);
      const start = Math.max(0, pos - 80);
      const end = Math.min(cleaned.length, pos + 80);
      const ctx = cleaned.slice(start, end);
      const pointer = ' '.repeat(Math.min(80, pos - start)) + '^^^';
      console.error(`JSON parse error at position ${pos}:`);
      console.error(ctx);
      console.error(pointer);
    }
    throw err;
  }
}

// ── Helpers ────────────────────────────────────────────────────────────

function readFileOrExit(filePath, label) {
  try {
    return fs.readFileSync(filePath, 'utf8');
  } catch (err) {
    console.error(`[ERROR] Cannot read ${label}: ${filePath}`);
    console.error(`  ${err.message}`);
    process.exit(1);
  }
}

function formatError(msg) {
  console.error(`[ERROR] ${msg}`);
  process.exit(1);
}

// ── Main ───────────────────────────────────────────────────────────────

function main() {
  const args = process.argv.slice(2);
  const isCheck = args.includes('--check');

  // 1. Read source file (readFileOrExit handles missing file with an error + exit)
  const sourceText = readFileOrExit(SOURCE_FILE, 'source configuration');

  // 2. Parse JSONC
  let config;
  try {
    config = parseJSONC(sourceText);
  } catch (err) {
    formatError(`Failed to parse source JSONC: ${err.message}`);
  }

  // 3. Validate source structure
  if (!config.agents || typeof config.agents !== 'object') {
    formatError('Source file must contain an "agents" object');
  }

  // 4. Process each agent: resolve promptPath/orchestratorPromptPath
  for (const [name, agent] of Object.entries(config.agents)) {
    if (!agent || typeof agent !== 'object') {
      formatError(`Agent "${name}" must be an object`);
    }

    // Resolve promptPath
    if (agent.promptPath) {
      const promptFile = path.resolve(REPO_ROOT, agent.promptPath);
      if (!fs.existsSync(promptFile)) {
        formatError(`Agent "${name}": prompt file not found: ${agent.promptPath}`);
      }
      const promptContent = fs.readFileSync(promptFile, 'utf8').replace(/\n$/, '');
      if (!promptContent) {
        formatError(`Agent "${name}": prompt file is empty: ${agent.promptPath}`);
      }
      agent.prompt = promptContent;
      delete agent.promptPath;
    }

    // Resolve orchestratorPromptPath
    if (agent.orchestratorPromptPath) {
      const orchFile = path.resolve(REPO_ROOT, agent.orchestratorPromptPath);
      if (!fs.existsSync(orchFile)) {
        formatError(`Agent "${name}": orchestrator prompt file not found: ${agent.orchestratorPromptPath}`);
      }
      const orchContent = fs.readFileSync(orchFile, 'utf8').replace(/\n$/, '');
      if (!orchContent) {
        formatError(`Agent "${name}": orchestrator prompt file is empty: ${agent.orchestratorPromptPath}`);
      }

      // Validate: orchestrator prompt must start with @<agent-name>
      const expectedTag = `@${name}`;
      if (!orchContent.startsWith(expectedTag)) {
        formatError(
          `Agent "${name}": orchestrator prompt must start with "${expectedTag}" ` +
          `but it starts with: ${orchContent.slice(0, Math.min(40, orchContent.length)).replace(/\n/g, '\\n')}`
        );
      }

      agent.orchestratorPrompt = orchContent;
      delete agent.orchestratorPromptPath;
    }

    // Validate that prompt and orchestratorPrompt are now present
    if (!agent.prompt) {
      formatError(`Agent "${name}": missing prompt (no promptPath resolved)`);
    }
    if (!agent.orchestratorPrompt) {
      formatError(`Agent "${name}": missing orchestratorPrompt (no orchestratorPromptPath resolved)`);
    }
  }

  // 5. Serialize
  const generatedJSON = JSON.stringify(config, null, 2) + '\n';

  // 6. Check mode or write mode
  if (isCheck) {
    if (!fs.existsSync(RUNTIME_FILE)) {
      console.error('[CHECK] Runtime file does not exist. Run build first.');
      process.exit(1);
    }

    const currentText = fs.readFileSync(RUNTIME_FILE, 'utf8');

    if (generatedJSON === currentText) {
      console.log('[CHECK] Generated config matches runtime file. Up-to-date.');
      process.exit(0);
    } else {
      console.error('[CHECK] Generated config differs from runtime file.');
      console.error('  Run `npm run opencode:build` or `pnpm opencode:build` to rebuild.');
      process.exit(1);
    }
  } else {
    // Write runtime file
    fs.writeFileSync(RUNTIME_FILE, generatedJSON, 'utf8');
    console.log(`[BUILD] Wrote ${RUNTIME_FILE}`);
    console.log(`  Agents processed: ${Object.keys(config.agents).length}`);
    console.log('  All prompts inlined, promptPath/orchestratorPromptPath removed.');
  }
}

main();
