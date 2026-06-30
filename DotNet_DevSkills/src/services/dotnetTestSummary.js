export function parseTestSummary(output = '') {
  const summary = { total: 0, passed: 0, failed: 0, skipped: 0, duration: null };

  const totalTestsMatch = output.match(/Total tests?\s*:\s*(\d+),\s*Passed:\s*(\d+),\s*Failed:\s*(\d+),\s*Skipped:\s*(\d+)/i);
  if (totalTestsMatch) {
    summary.total = Number(totalTestsMatch[1]);
    summary.passed = Number(totalTestsMatch[2]);
    summary.failed = Number(totalTestsMatch[3]);
    summary.skipped = Number(totalTestsMatch[4]);
    return summary;
  }

  const xunitMatch = output.match(/(?:Passed!|Failed!|Total:).*?Failed:\s*(\d+),\s*Passed:\s*(\d+),\s*Skipped:\s*(\d+),\s*Total:\s*(\d+)/i);
  if (xunitMatch) {
    summary.total = Number(xunitMatch[4]);
    summary.passed = Number(xunitMatch[2]);
    summary.failed = Number(xunitMatch[1]);
    summary.skipped = Number(xunitMatch[3]);
  }

  const durationMatch = output.match(/Duration:\s*([^,\n]+)/i);
  if (durationMatch) {
    summary.duration = durationMatch[1].trim();
  }

  return summary;
}

export function filterConsoleOutput(output = '') {
  const lines = String(output || '').split(/\r?\n/);
  const filtered = [];
  const seen = new Set();

  lines.forEach((line) => {
    const trimmed = line.trim();
    if (!trimmed) {
      return;
    }

    const lower = trimmed.toLowerCase();
    if (/\bwarning\b/i.test(lower) || /\bwarn\b/i.test(lower)) {
      return;
    }

    if (
      /\berror\b/i.test(lower) ||
      /\bfailed\b/i.test(lower) ||
      /\bexception\b/i.test(lower) ||
      /\bassert\b/i.test(lower) ||
      /^passed!/i.test(trimmed) ||
      /^failed!/i.test(trimmed) ||
      /^total tests:/i.test(trimmed) ||
      /^test run/i.test(trimmed) ||
      /^build failed/i.test(trimmed) ||
      /^build succeeded/i.test(trimmed) ||
      /^test run successful/i.test(trimmed)
    ) {
      if (!seen.has(trimmed)) {
        seen.add(trimmed);
        filtered.push(trimmed);
      }
    }
  });

  return filtered;
}
