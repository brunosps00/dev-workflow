const readline = require('readline');

function question(prompt, options) {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  return new Promise((resolve) => {
    const optionsStr = options.map((o, i) => `  ${i + 1}) ${o}`).join('\n');
    rl.question(`\n${prompt}\n${optionsStr}\n\n  Choose [1-${options.length}]: `, (answer) => {
      rl.close();
      const idx = parseInt(answer, 10) - 1;
      if (idx >= 0 && idx < options.length) {
        resolve(options[idx]);
      } else {
        resolve(options[0]);
      }
    });
  });
}

async function selectLanguage(flagLang) {
  if (flagLang && ['en', 'pt-br'].includes(flagLang)) {
    return flagLang;
  }

  const lang = await question('Select language / Selecione o idioma:', [
    'en',
    'pt-br',
  ]);

  return lang;
}

// Multi-select prompt. Accepts comma-separated indexes ("1,3,5"), "all" for every
// option, or a single index. Returns an array of selected option strings.
// Invalid or empty input falls back to the first option.
function multiSelect(prompt, options) {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  return new Promise((resolve) => {
    const optionsStr = options.map((o, i) => `  ${i + 1}) ${o}`).join('\n');
    const help = `\n  Enter numbers separated by commas (e.g. 1,3,5) or "all" for everything.`;
    rl.question(`\n${prompt}\n${optionsStr}${help}\n\n  Choose: `, (answer) => {
      rl.close();
      const trimmed = (answer || '').trim().toLowerCase();
      if (!trimmed) {
        resolve([options[0]]);
        return;
      }
      if (trimmed === 'all') {
        resolve(options.slice());
        return;
      }
      const seen = new Set();
      const selected = [];
      for (const part of trimmed.split(',')) {
        const idx = parseInt(part.trim(), 10) - 1;
        if (idx >= 0 && idx < options.length && !seen.has(idx)) {
          seen.add(idx);
          selected.push(options[idx]);
        }
      }
      resolve(selected.length > 0 ? selected : [options[0]]);
    });
  });
}

module.exports = { selectLanguage, question, multiSelect };
