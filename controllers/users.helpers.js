export const getFriendship = (profileUser, currentUserId) => {
  return {
    friends: profileUser.friends?.some(objectId => objectId.toString() == currentUserId), // Showing off two different ways of comaring ObjectId's to string
    following: profileUser.followers?.some(objectId => objectId.toString() == currentUserId),
    requestSent: profileUser.requestsReceived?.some(objectId => objectId.equals(currentUserId)),
    requestReceived: profileUser.requestsSent?.some(objectId => objectId.equals(currentUserId)),
  };
};
