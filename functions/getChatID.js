exports.getChatID = (fromID, toID) => {
  if (fromID < toID) return `${fromID}-${toID}`;
  return `${toID}-${fromID}`;
};
