export const getFriendship = (profileUser, currentUserId) => {
  return {
    friends: profileUser.friends.some(friend => friend._id == currentUserId), //has to be shallow equal bc ObjctId
    following: profileUser.followers.includes(currentUserId),
    requestSent: profileUser.requestsReceived.includes(currentUserId),
    requestReceived: profileUser.requestsSent.includes(currentUserId),
  };
};
