const { getGitVersion } = require("../../endpoints/utils");
const { Telemetry } = require("../../models/telemetry");

// Privacy-First: Telemetry is DISABLED by default in Shroud LLM.
// If you explicitly want to enable telemetry, set ENABLE_TELEMETRY=true in your .env
// Shroud LLM prioritizes your privacy and does not collect any usage data by default.
async function setupTelemetry() {
  // Privacy-first: Telemetry is opt-in, not opt-out
  if (process.env.ENABLE_TELEMETRY !== "true") {
    console.log(
      `\x1b[32m[PRIVACY MODE]\x1b[0m Telemetry is disabled by default. Shroud LLM respects your privacy.`
    );
    return true;
  }

  if (Telemetry.isDev()) {
    console.log(
      `\x1b[33m[TELEMETRY STUBBED]\x1b[0m Telemetry stubbed in development.`
    );
    return;
  }

  console.log(
    `\x1b[33m[TELEMETRY ENABLED]\x1b[0m You have explicitly enabled telemetry. To disable, remove ENABLE_TELEMETRY from .env`
  );
  await Telemetry.findOrCreateId();
  await Telemetry.sendTelemetry("server_boot", {
    commit: getGitVersion(),
  });
  return;
}

module.exports = setupTelemetry;
