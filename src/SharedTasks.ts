/**
 * Converts the casing of a string.
 *
 * @export
 * @param {string} name The name to convert.
 * @param {string} caseType The case type to convert into.
 * @returns The converted name.
 */
export function convertCase (name: string, caseType: string) {
  const tempName = name.split('_').map(s => {
    if (s.length === 0) return s
    return s[0].toUpperCase() + s.substr(1)
  }).join('')
  switch (caseType) {
    case 'pascal':
      return tempName
    case 'camel':
      return tempName[0].toLowerCase() + tempName.substr(1)
    case 'lower':
      return name.toLowerCase()
    case 'upper':
      return name.toUpperCase()
    default:
      return name
  }
}
