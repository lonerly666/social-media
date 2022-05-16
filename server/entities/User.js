"use strict";

class User {
  static FIELDS = {
    NICKNAME: "nickname",
    DATE_OF_BIRTH: "dateOfBirth",
    BIO: "bio",
    GENDER: "gender",
    NUM_OF_POSTS: "numOfPosts",
    FRIENDS_LIST: "friendsList",
    LAST_SEEN_NOTIFICATION: "lastSeenNoti",
    LAST_SEEN_FRIEND_REQ: "lastSeenFriendReq",
    IMAGE_DETAILS: "imageDetails",
  };

  constructor(build) {
    if (arguments.length === 1 && this.validateBuild(build)) {
      const nickname = build.nickname;
      const dateOfBirth = build.dateOfBirth;
      const bio = build.bio;
      const gender = build.gender;
      const numOfPosts = build.numOfPosts;
      const friendsList = build.friendsList;
      const lastSeenFriendReq = build.lastSeenFriendReq;
      const lastSeenNoti = build.lastSeenNoti;
      const imageDetails = build.imageDetails;
      const profileImage = build.profileImage;

      Object.defineProperties(this, {
        nickname: {
          value: nickname,
          writable: false,
        },
        dateOfBirth: {
          value: dateOfBirth,
          writable: false,
        },
        bio: {
          value: bio,
          writable: false,
        },
        gender: {
          value: gender,
          writable: false,
        },
        numOfPosts: {
          value: numOfPosts,
          writable: false,
        },
        friendsList: {
          value: friendsList,
          writable: false,
        },
        lastSeenFriendReq: {
          value: lastSeenFriendReq,
          writable: false,
        },
        lastSeenNoti: {
          value: lastSeenNoti,
          writable: false,
        },
        profileImage: {
          value: profileImage,
          writable: false,
        },
        imageDetails: {
          value: imageDetails,
          writable: false,
        },
      });
    }
  }
  validateBuild(build) {
    return String(build.constructor) === String(User.Builder);
  }
  static get Builder() {
    class Builder {
      setNickname(nickname) {
        this.nickname = nickname;
        return this;
      }
      setDateOfBirth(dateOfBirth) {
        this.dateOfBirth = dateOfBirth;
        return this;
      }
      setBio(bio) {
        this.bio = bio;
        return this;
      }
      setGender(gender) {
        this.gender = gender;
        return this;
      }
      setNumOfPosts(numOfPosts) {
        this.numOfPosts = numOfPosts;
        return this;
      }
      setFriendsList(friendsList) {
        this.friendsList = friendsList;
        return this;
      }
      setLastSeenNoti(seenDate) {
        this.lastSeenNoti = seenDate;
        return this;
      }
      setLastSeenFriendReq(seenDate) {
        this.lastSeenFriendReq = seenDate;
        return this;
      }
      setProfileImage(profileImage) {
        this.profileImage = profileImage;
        return this;
      }
      setImageDetails(imageDetails) {
        this.imageDetails = imageDetails;
        return this;
      }
      build() {
        return new User(this);
      }
    }
    return Builder;
  }
}

module.exports = User;
