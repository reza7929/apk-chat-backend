exports.getChatID = (fromID, toID) => {
  // create custom id for massages
  if (fromID < toID) return `${fromID}-${toID}`;
  return `${toID}-${fromID}`;
};
