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
    return s[0].toUpperCase() + s.substr(1).toLowerCase()
  }).join('')
  if (caseType == 'pascal') {
    return tempName
  }
  else if (caseType == 'camel') {
    return tempName[0].toLowerCase() + tempName.substr(1)
  }
  return name
}