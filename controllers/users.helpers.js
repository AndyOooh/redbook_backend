export const getFriendship = (profileUser, currentUserId) => {
  return {
    friends: profileUser.friends?.some(objectId => objectId._id.equals(currentUserId)),
    following: profileUser.followers?.some(objectId => objectId.equals(currentUserId)),
    requestSent: profileUser.requestsReceived?.some(objectId => objectId.equals(currentUserId)),
    requestReceived: profileUser.requestsSent?.some(objectId => objectId.equals(currentUserId)),
  };
};
