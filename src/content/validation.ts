export function assertUnique(values: string[], label: string) {
  const duplicates = values.filter((value, index) => values.indexOf(value) !== index);
  if (duplicates.length > 0) {
    throw new Error(`${label} duplicados: ${[...new Set(duplicates)].join(', ')}`);
  }
}
