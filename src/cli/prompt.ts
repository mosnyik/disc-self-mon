import readline from 'readline';

export function prompt(question: string): Promise<string> {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
  });

  return new Promise((resolve) => {
    rl.question(question, (answer) => {
      rl.close();
      resolve(answer.trim());
    });
  });
}

export async function promptYesNo(question: string, defaultValue: boolean = true): Promise<boolean> {
  const hint = defaultValue ? 'Y/n' : 'y/N';
  const answer = await prompt(`${question} (${hint}): `);

  if (!answer) return defaultValue;
  return answer.toLowerCase() === 'y';
}

export async function promptNumber(question: string, defaultValue: number): Promise<number> {
  const answer = await prompt(`${question} [${defaultValue}]: `);

  if (!answer) return defaultValue;

  const parsed = parseInt(answer);
  return isNaN(parsed) ? defaultValue : parsed;
}
