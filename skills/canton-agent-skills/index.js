/**
 * @caypo/canton-agent-skills — Skill loader
 *
 * Loads all YAML skill definitions for AI coding assistants.
 * Compatible with: Claude Code, OpenAI Codex, GitHub Copilot, Cursor, Windsurf, Amp
 */

const fs = require("fs");
const path = require("path");

const SKILLS_DIR = path.join(__dirname, "skills");

function loadSkills() {
  const files = fs.readdirSync(SKILLS_DIR).filter((f) => f.endsWith(".yaml"));
  return files.map((f) => ({
    file: f,
    path: path.join(SKILLS_DIR, f),
    name: f.replace(".yaml", ""),
  }));
}

module.exports = { loadSkills, SKILLS_DIR };

if (require.main === module) {
  const skills = loadSkills();
  console.log(`@caypo/canton-agent-skills — ${skills.length} skills loaded`);
  console.log("");
  for (const s of skills) {
    console.log(`  ${s.name}`);
  }
}
