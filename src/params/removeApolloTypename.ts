// Recursively remove "__typename" fields from Apollo object
function removeApolloTypename(data) {
  if (Array.isArray(data)) {
    return data.map(removeApolloTypename);
  }

  if (data && typeof data === 'object') {
    const cleanData = {};

    Object.keys(data).forEach((key) => {
      if (key !== '__typename') {
        cleanData[key] = removeApolloTypename(data[key]);
      }
    });

    return cleanData;
  }

  return data;
}

export default removeApolloTypename;
