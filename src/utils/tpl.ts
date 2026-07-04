/**
 * Simple template interpolation.
 * Replaces `{key}` placeholders with corresponding values.
 *
 * @example
 *   tpl('Hello {name}!', { name: 'World' }) // 'Hello World!'
 *   tpl('{x} de {y}', { x: 1, y: 10 })     // '1 de 10'
 */
export function tpl(
  template: string,
  params: Record<string, string | number>,
): string {
  return template.replace(/\{(\w+)\}/g, (_, key: string) => {
    const value = params[key];
    return value === undefined ? `{${key}}` : String(value);
  });
}
