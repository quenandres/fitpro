import { twMerge } from 'tailwind-merge';

function collectClasses(value: unknown, classes: string[]) {
  if (!value) return;
  if (typeof value === 'string') {
    classes.push(value);
    return;
  }
  if (Array.isArray(value)) {
    for (const item of value) collectClasses(item, classes);
  }
}

/** Junta clases de Tailwind. Acepta los className de Motion, que no siempre son string. */
export function cn(...inputs: unknown[]) {
  const classes: string[] = [];
  for (const input of inputs) collectClasses(input, classes);
  return twMerge(classes.join(' '));
}
