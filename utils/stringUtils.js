
exports.excludeSpecialCharacters = (inputString) => {
  // Define a regular expression pattern to match the specified characters
  const pattern = /[\/\\:*?"<>'|]/g;
  
  // Use the replace method to replace matched characters with an empty string
  const filteredString = inputString.replace(pattern, ' ');
  
  return filteredString;
}