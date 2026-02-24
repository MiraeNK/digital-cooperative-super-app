import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
import { 
  getFirestore, 
  doc, 
  getDoc, 
  setDoc, 
  serverTimestamp,
  collection,
  query,
  where,
  getDocs,
  addDoc,
  deleteDoc,
  updateDoc,
  orderBy,
  limit,
  Timestamp,
  arrayUnion,
  arrayRemove
} from "firebase/firestore";

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY || "",
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN || "",
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || "",
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET || "",
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || "",
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID || "",
};

// Validate that Firebase config is properly loaded
const isConfigValid = firebaseConfig.apiKey && firebaseConfig.authDomain && firebaseConfig.projectId;

let app: any;
let auth: any;
let db: any;
let googleProvider: any;

if (isConfigValid) {
  app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
  auth = getAuth(app);
  db = getFirestore(app);
  googleProvider = new GoogleAuthProvider();
} else {
  console.warn("Firebase configuration is incomplete. Check environment variables.");
  // Create dummy objects to prevent runtime errors during build
  app = null;
  auth = null;
  db = null;
  googleProvider = null;
}

export { auth, db, googleProvider };

// Fungsi helper simpan user
export const createUserProfile = async (user: any, name: string) => {
  if (!user || !db) return;
  
  const userRef = doc(db, "users", user.uid);
  const userSnap = await getDoc(userRef);

  if (!userSnap.exists()) {
    try {
      await setDoc(userRef, {
        uid: user.uid,
        email: user.email,
        displayName: name || user.displayName || "Anggota",
        role: "member",
        createdAt: serverTimestamp(),
      });
    } catch (error) {
      console.error("Error creating user profile:", error);
    }
  }
};

export const getUserProfile = async (uid: string) => {
  if (!db) return null;
  const userRef = doc(db, "users", uid);
  const userSnap = await getDoc(userRef);
  if (userSnap.exists()) return userSnap.data();
  return null;
};

export const updateUserProfileData = async (uid: string, data: any) => {
  if (!db) throw new Error("Database not initialized");
  const userRef = doc(db, "users", uid);
  try {
    await updateDoc(userRef, {
      ...data,
      updatedAt: serverTimestamp(),
    });
    return true;
  } catch (error) {
    console.error("Error updating profile:", error);
    throw error;
  }
};

export const generateMemberId = (role: string) => {
  const prefix = role === "admin" ? "ADM" : "KOP";
  const year = new Date().getFullYear();
  const random = Math.floor(100000 + Math.random() * 900000); // 6 digit random
  return `${prefix}-${year}-${random}`;
};

// ============== ARTICLES FUNCTIONS ==============
export const createArticle = async (userId: string, articleData: any) => {
  if (!db) throw new Error("Database not initialized");
  try {
    const docRef = await addDoc(collection(db, "articles"), {
      ...articleData,
      authorId: userId,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
      views: 0,
      likes: 0,
    });
    return docRef.id;
  } catch (error) {
    console.error("Error creating article:", error);
    throw error;
  }
};

export const getArticles = async (limit_count: number = 10) => {
  if (!db) return [];
  try {
    const q = query(
      collection(db, "articles"),
      orderBy("createdAt", "desc"),
      limit(limit_count)
    );
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      createdAt: doc.data().createdAt?.toDate(),
      updatedAt: doc.data().updatedAt?.toDate(),
    }));
  } catch (error) {
    console.error("Error fetching articles:", error);
    return [];
  }
};

export const getArticleById = async (articleId: string) => {
  if (!db) return null;
  try {
    const docRef = doc(db, "articles", articleId);
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
      return { id: docSnap.id, ...docSnap.data() };
    }
    return null;
  } catch (error) {
    console.error("Error fetching article:", error);
    return null;
  }
};

export const getArticlesByAuthor = async (authorId: string) => {
  if (!db) return [];
  try {
    const q = query(
      collection(db, "articles"),
      where("authorId", "==", authorId),
      orderBy("createdAt", "desc")
    );
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      createdAt: doc.data().createdAt?.toDate(),
      updatedAt: doc.data().updatedAt?.toDate(),
    }));
  } catch (error) {
    console.error("Error fetching author articles:", error);
    return [];
  }
};

export const updateArticle = async (articleId: string, data: any) => {
  if (!db) throw new Error("Database not initialized");
  try {
    const docRef = doc(db, "articles", articleId);
    await updateDoc(docRef, {
      ...data,
      updatedAt: serverTimestamp(),
    });
    return true;
  } catch (error) {
    console.error("Error updating article:", error);
    throw error;
  }
};

export const deleteArticle = async (articleId: string) => {
  if (!db) throw new Error("Database not initialized");
  try {
    await deleteDoc(doc(db, "articles", articleId));
    return true;
  } catch (error) {
    console.error("Error deleting article:", error);
    throw error;
  }
};

// ============== FORUM POSTS FUNCTIONS ==============
export const createForumPost = async (userId: string, postData: any) => {
  if (!db) throw new Error("Database not initialized");
  try {
    const docRef = await addDoc(collection(db, "forumPosts"), {
      ...postData,
      authorId: userId,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
      upvotes: 0,
      downvotes: 0,
      commentsCount: 0,
    });
    return docRef.id;
  } catch (error) {
    console.error("Error creating forum post:", error);
    throw error;
  }
};

export const getForumPosts = async () => {
  if (!db) return [];
  try {
    const q = query(
      collection(db, "forumPosts"),
      orderBy("createdAt", "desc")
    );
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      createdAt: doc.data().createdAt?.toDate(),
      updatedAt: doc.data().updatedAt?.toDate(),
    }));
  } catch (error) {
    console.error("Error fetching forum posts:", error);
    return [];
  }
};

export const getForumPostById = async (postId: string) => {
  if (!db) return null;
  try {
    const docRef = doc(db, "forumPosts", postId);
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
      return { id: docSnap.id, ...docSnap.data() };
    }
    return null;
  } catch (error) {
    console.error("Error fetching forum post:", error);
    return null;
  }
};

export const updateForumPost = async (postId: string, data: any) => {
  if (!db) throw new Error("Database not initialized");
  try {
    const docRef = doc(db, "forumPosts", postId);
    await updateDoc(docRef, {
      ...data,
      updatedAt: serverTimestamp(),
    });
    return true;
  } catch (error) {
    console.error("Error updating forum post:", error);
    throw error;
  }
};

export const deleteForumPost = async (postId: string) => {
  if (!db) throw new Error("Database not initialized");
  try {
    await deleteDoc(doc(db, "forumPosts", postId));
    return true;
  } catch (error) {
    console.error("Error deleting forum post:", error);
    throw error;
  }
};

// ============== COMMENTS FUNCTIONS ==============
export const addCommentToPost = async (postId: string, userId: string, content: string) => {
  if (!db) throw new Error("Database not initialized");
  try {
    // Validate required fields
    if (!postId || !userId || !content) {
      throw new Error(`Missing required fields: postId=${postId}, userId=${userId}, content=${content}`);
    }

    const docRef = await addDoc(collection(db, `forumPosts/${postId}/comments`), {
      authorId: userId,
      content,
      createdAt: serverTimestamp(),
      upvotes: 0,
      downvotes: 0,
    });
    
    // Update comment count di post
    const postRef = doc(db, "forumPosts", postId);
    const postSnap = await getDoc(postRef);
    if (postSnap.exists()) {
      await updateDoc(postRef, {
        commentsCount: (postSnap.data().commentsCount || 0) + 1,
      });
    }
    
    return docRef.id;
  } catch (error) {
    console.error("Error adding comment:", error);
    throw error;
  }
};

export const getCommentsForPost = async (postId: string) => {
  if (!db) return [];
  try {
    const q = query(
      collection(db, `forumPosts/${postId}/comments`),
      orderBy("createdAt", "desc")
    );
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      createdAt: doc.data().createdAt?.toDate(),
    }));
  } catch (error) {
    console.error("Error fetching comments:", error);
    return [];
  }
};

export const deleteComment = async (postId: string, commentId: string) => {
  if (!db) throw new Error("Database not initialized");
  try {
    await deleteDoc(doc(db, `forumPosts/${postId}/comments`, commentId));
    
    // Update comment count
    const postRef = doc(db, "forumPosts", postId);
    const postSnap = await getDoc(postRef);
    if (postSnap.exists()) {
      await updateDoc(postRef, {
        commentsCount: Math.max(0, (postSnap.data().commentsCount || 1) - 1),
      });
    }
    
    return true;
  } catch (error) {
    console.error("Error deleting comment:", error);
    throw error;
  }
};

// ============== MESSAGES FUNCTIONS ==============
export const sendMessage = async (senderId: string, receiverId: string, text: string) => {
  if (!db) throw new Error("Database not initialized");
  try {
    // Create message document
    const messageRef = await addDoc(collection(db, "messages"), {
      senderId,
      receiverId,
      text,
      timestamp: serverTimestamp(),
      read: false,
    });
    return messageRef.id;
  } catch (error) {
    console.error("Error sending message:", error);
    throw error;
  }
};

export const getConversation = async (userId1: string, userId2: string) => {
  if (!db) return [];
  try {
    const q = query(
      collection(db, "messages"),
      where("senderId", "in", [userId1, userId2]),
      orderBy("timestamp", "desc")
    );
    const snapshot = await getDocs(q);
    
    // Filter untuk hanya messages antara 2 user ini
    return snapshot.docs
      .filter(doc => {
        const data = doc.data();
        return (data.senderId === userId1 && data.receiverId === userId2) ||
               (data.senderId === userId2 && data.receiverId === userId1);
      })
      .map(doc => ({
        id: doc.id,
        ...doc.data(),
        timestamp: doc.data().timestamp?.toDate(),
      }))
      .reverse();
  } catch (error) {
    console.error("Error fetching conversation:", error);
    return [];
  }
};

export const markMessageAsRead = async (messageId: string) => {
  if (!db) throw new Error("Database not initialized");
  try {
    const docRef = doc(db, "messages", messageId);
    await updateDoc(docRef, { read: true });
    return true;
  } catch (error) {
    console.error("Error marking message as read:", error);
    throw error;
  }
};

// ============== USERS/MEMBERS FUNCTIONS ==============
export const getAllMembers = async () => {
  if (!db) return [];
  try {
    const q = query(collection(db, "users"), where("role", "==", "member"));
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      createdAt: doc.data().createdAt?.toDate(),
    }));
  } catch (error) {
    console.error("Error fetching members:", error);
    return [];
  }
};

export const getMemberStats = async () => {
  if (!db) return { totalMembers: 0, totalWriters: 0, activeMembers: 0 };
  try {
    const memberQuery = query(collection(db, "users"), where("role", "==", "member"));
    const memberSnap = await getDocs(memberQuery);
    
    const writerQuery = query(collection(db, "users"), where("role", "==", "writer"));
    const writerSnap = await getDocs(writerQuery);
    
    return {
      totalMembers: memberSnap.size,
      totalWriters: writerSnap.size,
      activeMembers: memberSnap.docs.filter(doc => doc.data().status !== "inactive").length,
    };
  } catch (error) {
    console.error("Error fetching member stats:", error);
    return { totalMembers: 0, totalWriters: 0, activeMembers: 0 };
  }
};

// ============== VOTE FUNCTIONS ==============
export const voteOnPost = async (postId: string, userId: string, voteType: "upvote" | "downvote") => {
  if (!db) throw new Error("Database not initialized");
  try {
    const postRef = doc(db, "forumPosts", postId);
    const postSnap = await getDoc(postRef);
    
    if (!postSnap.exists()) return false;
    
    const currentData = postSnap.data();
    const upvotes = currentData.upvotes || 0;
    const downvotes = currentData.downvotes || 0;
    
    if (voteType === "upvote") {
      await updateDoc(postRef, { upvotes: upvotes + 1 });
    } else {
      await updateDoc(postRef, { downvotes: downvotes + 1 });
    }
    
    return true;
  } catch (error) {
    console.error("Error voting on post:", error);
    throw error;
  }
};

// ============== WRITER STATS FUNCTIONS ==============
export const getWriterStats = async (writerId: string) => {
  try {
    const articlesQuery = query(
      collection(db, "articles"),
      where("authorId", "==", writerId)
    );
    const articlesSnap = await getDocs(articlesQuery);
    
    let totalViews = 0;
    let totalLikes = 0;
    
    articlesSnap.docs.forEach(doc => {
      totalViews += doc.data().views || 0;
      totalLikes += doc.data().likes || 0;
    });
    
    return {
      totalArticles: articlesSnap.size,
      totalViews,
      totalLikes,
      averageViewsPerArticle: articlesSnap.size > 0 ? Math.round(totalViews / articlesSnap.size) : 0,
    };
  } catch (error) {
    console.error("Error fetching writer stats:", error);
    return { totalArticles: 0, totalViews: 0, totalLikes: 0, averageViewsPerArticle: 0 };
  }
};

// ============== ENHANCED COMMENT FUNCTIONS WITH USER DATA ==============
export const getCommentsForPostWithUserData = async (postId: string) => {
  try {
    const q = query(
      collection(db, `forumPosts/${postId}/comments`),
      orderBy("createdAt", "desc")
    );
    const snapshot = await getDocs(q);
    
    const commentsWithUserData = await Promise.all(
      snapshot.docs.map(async (doc) => {
        const commentData = doc.data();
        const userData = await getUserProfile(commentData.authorId);
        return {
          id: doc.id,
          ...commentData,
          createdAt: commentData.createdAt?.toDate(),
          author: userData?.displayName || "Anonymous",
          authorId: commentData.authorId,
          avatar: userData?.avatar || null,
        };
      })
    );
    
    return commentsWithUserData;
  } catch (error) {
    console.error("Error fetching comments with user data:", error);
    return [];
  }
};

// ============== USER SEARCH & DISCOVERY FUNCTIONS ==============
export const getUserById = async (userId: string) => {
  if (!db) return null;
  try {
    const userRef = doc(db, "users", userId);
    const userSnap = await getDoc(userRef);
    if (userSnap.exists()) {
      return {
        id: userSnap.id,
        ...userSnap.data(),
        createdAt: userSnap.data().createdAt?.toDate(),
      };
    }
    return null;
  } catch (error) {
    console.error("Error fetching user:", error);
    return null;
  }
};

// ============== FRIEND/CONNECTION SYSTEM ==============
export const sendFriendRequest = async (senderId: string, receiverId: string) => {
  if (!db) throw new Error("Database not initialized");
  try {
    // Check if already friends or request exists
    const userRef = doc(db, "users", receiverId);
    const userSnap = await getDoc(userRef);
    
    if (!userSnap.exists()) {
      throw new Error("User tidak ditemukan");
    }
    
    const userData = userSnap.data();
    const friends = userData.friends || [];
    const pendingRequests = userData.pendingFriendRequests || [];
    
    if (friends.includes(senderId)) {
      throw new Error("Sudah berteman dengan user ini");
    }
    
    if (pendingRequests.includes(senderId)) {
      throw new Error("Friend request sudah dikirim");
    }
    
    // Add to pending requests
    await updateDoc(userRef, {
      pendingFriendRequests: arrayUnion(senderId),
    });
    
    return { success: true, message: "Friend request dikirim" };
  } catch (error) {
    console.error("Error sending friend request:", error);
    throw error;
  }
};

export const acceptFriendRequest = async (userId: string, friendId: string) => {
  if (!db) throw new Error("Database not initialized");
  try {
    const userRef = doc(db, "users", userId);
    const friendRef = doc(db, "users", friendId);
    
    // Update both users: remove from pending, add to friends
    await updateDoc(userRef, {
      pendingFriendRequests: arrayRemove(friendId),
      friends: arrayUnion(friendId),
    });
    
    await updateDoc(friendRef, {
      friends: arrayUnion(userId),
    });
    
    return { success: true, message: "Friend request diterima" };
  } catch (error) {
    console.error("Error accepting friend request:", error);
    throw error;
  }
};

export const rejectFriendRequest = async (userId: string, friendId: string) => {
  if (!db) throw new Error("Database not initialized");
  try {
    const userRef = doc(db, "users", userId);
    
    await updateDoc(userRef, {
      pendingFriendRequests: arrayRemove(friendId),
    });
    
    return { success: true, message: "Friend request ditolak" };
  } catch (error) {
    console.error("Error rejecting friend request:", error);
    throw error;
  }
};

export const getUserFriends = async (userId: string) => {
  if (!db) return [];
  try {
    const userRef = doc(db, "users", userId);
    const userSnap = await getDoc(userRef);
    
    if (!userSnap.exists()) {
      return [];
    }
    
    const friends = userSnap.data().friends || [];
    
    // Get profile data for each friend
    const friendsData = await Promise.all(
      friends.map(async (friendId: string) => {
        const friendData = await getUserProfile(friendId);
        return {
          id: friendId,
          ...friendData,
        };
      })
    );
    
    return friendsData;
  } catch (error) {
    console.error("Error fetching user friends:", error);
    return [];
  }
};

export const getPendingFriendRequests = async (userId: string) => {
  if (!db) return [];
  try {
    const userRef = doc(db, "users", userId);
    const userSnap = await getDoc(userRef);
    
    if (!userSnap.exists()) {
      return [];
    }
    
    const pendingRequests = userSnap.data().pendingFriendRequests || [];
    
    // Get profile data for each pending request
    const requestsData = await Promise.all(
      pendingRequests.map(async (requesterId: string) => {
        const requesterData = await getUserProfile(requesterId);
        return {
          id: requesterId,
          ...requesterData,
        };
      })
    );
    
    return requestsData;
  } catch (error) {
    console.error("Error fetching pending friend requests:", error);
    return [];
  }
};

export const searchUsers = async (searchQuery: string) => {
  if (!db) return [];
  try {
    if (!searchQuery.trim()) {
      return [];
    }
    
    const q = query(
      collection(db, "users"),
      where("displayName", ">=", searchQuery),
      where("displayName", "<=", searchQuery + "\uf8ff")
    );
    
    const snapshot = await getDocs(q);
    
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      createdAt: doc.data().createdAt?.toDate(),
    }));
  } catch (error) {
    console.error("Error searching users:", error);
    // Fallback: fetch all users dan filter client-side
    return [];
  }
};

export const getPendingMessages = async (userId: string) => {
  if (!db) return [];
  try {
    const userRef = doc(db, "users", userId);
    const userSnap = await getDoc(userRef);
    
    if (!userSnap.exists()) {
      return [];
    }
    
    const friends = userSnap.data().friends || [];
    
    // Get all messages where userId is receiver
    const q = query(
      collection(db, "messages"),
      where("receiverId", "==", userId),
      where("read", "==", false)
    );
    
    const snapshot = await getDocs(q);
    
    // Filter: only messages from non-friends (not in friends list)
    const pendingMessages = await Promise.all(
      snapshot.docs
        .filter(doc => !friends.includes(doc.data().senderId))
        .map(async (doc) => {
          const messageData = doc.data();
          const senderData = await getUserProfile(messageData.senderId);
          
          return {
            id: doc.id,
            ...messageData,
            timestamp: messageData.timestamp?.toDate(),
            senderData,
          };
        })
    );
    
    // Group by sender to get latest message per sender
    const groupedByChat = new Map();
    pendingMessages.forEach(msg => {
      const senderId = msg.senderId;
      if (!groupedByChat.has(senderId)) {
        groupedByChat.set(senderId, msg);
      }
    });
    
    return Array.from(groupedByChat.values()).sort(
      (a, b) => (b.timestamp?.getTime() || 0) - (a.timestamp?.getTime() || 0)
    );
  } catch (error) {
    console.error("Error fetching pending messages:", error);
    return [];
  }
};

// ============== PRESENCE (ONLINE / LAST SEEN) ==============
export const setUserOnline = async (userId: string) => {
  if (!db) return false;
  try {
    const userRef = doc(db, "users", userId);
    await updateDoc(userRef, {
      online: true,
      lastSeen: serverTimestamp(),
    });
    return true;
  } catch (error) {
    console.error("Error setting user online:", error);
    return false;
  }
};

export const setUserOffline = async (userId: string) => {
  if (!db) return false;
  try {
    const userRef = doc(db, "users", userId);
    await updateDoc(userRef, {
      online: false,
      lastSeen: serverTimestamp(),
    });
    return true;
  } catch (error) {
    console.error("Error setting user offline:", error);
    return false;
  }
};

export const sendMessageWithFriendCheck = async (senderId: string, receiverId: string, text: string) => {
  if (!db) throw new Error("Database not initialized");
  try {
    // Check if receiver exists
    const receiverRef = doc(db, "users", receiverId);
    const receiverSnap = await getDoc(receiverRef);
    
    if (!receiverSnap.exists()) {
      throw new Error("User penerima tidak ditemukan");
    }
    
    // Send message (regardless of friend status)
    const messageRef = await addDoc(collection(db, "messages"), {
      senderId,
      receiverId,
      text,
      timestamp: serverTimestamp(),
      read: false,
    });
    
    return messageRef.id;
  } catch (error) {
    console.error("Error sending message:", error);
    throw error;
  }
};

// ============== ARTICLE TAGS & CATEGORIES ==============
export const getArticlesByTag = async (tag: string) => {
  if (!db) return [];
  try {
    const q = query(
      collection(db, "articles"),
      where("tags", "array-contains", tag),
      orderBy("createdAt", "desc")
    );
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      createdAt: doc.data().createdAt?.toDate(),
      updatedAt: doc.data().updatedAt?.toDate(),
    }));
  } catch (error) {
    console.error("Error fetching articles by tag:", error);
    return [];
  }
};

export const getAllArticleTags = async () => {
  if (!db) return [];
  try {
    const snapshot = await getDocs(collection(db, "articles"));
    const tagsSet = new Set<string>();
    
    snapshot.docs.forEach(doc => {
      const tags = doc.data().tags || [];
      tags.forEach((tag: string) => tagsSet.add(tag));
    });
    
    return Array.from(tagsSet).sort();
  } catch (error) {
    console.error("Error fetching all tags:", error);
    return [];
  }
};

// ============== ENHANCED MESSAGING WITH USER DATA ==============
export const getMessagesWithUserData = async (userId1: string, userId2: string) => {
  try {
    const messages = await getConversation(userId1, userId2);
    const user2Data = await getUserProfile(userId2);
    
    return {
      messages,
      otherUser: {
        id: userId2,
        ...user2Data,
      }
    };
  } catch (error) {
    console.error("Error fetching messages with user data:", error);
    return { messages: [], otherUser: null };
  }
};

export const getUserChats = async (userId: string) => {
  if (!db) return [];
  try {
    const q = query(
      collection(db, "messages"),
      where("senderId", "==", userId)
    );
    const sent = await getDocs(q);
    
    const q2 = query(
      collection(db, "messages"),
      where("receiverId", "==", userId)
    );
    const received = await getDocs(q2);
    
    // Get unique conversation partners
    const conversationSet = new Map<string, any>();
    
    [...sent.docs, ...received.docs].forEach(doc => {
      const data = doc.data();
      const partnerId = data.senderId === userId ? data.receiverId : data.senderId;
      
      if (!conversationSet.has(partnerId)) {
        conversationSet.set(partnerId, {
          userId: partnerId,
          lastMessage: data.text,
          lastMessageTime: data.timestamp?.toDate(),
          read: data.read,
        });
      }
    });
    
    // Enhancement: fetch user data for each conversation partner
    const chatsWithUserData = await Promise.all(
      Array.from(conversationSet.values()).map(async (chat) => {
        const userData = await getUserProfile(chat.userId);
        return {
          ...chat,
          ...userData,
        };
      })
    );
    
    return chatsWithUserData.sort((a, b) => 
      (b.lastMessageTime?.getTime() || 0) - (a.lastMessageTime?.getTime() || 0)
    );
  } catch (error) {
    console.error("Error fetching user chats:", error);
    return [];
  }
};

// ============== FORUM POST WITH AUTHOR DATA ==============
export const getForumPostsWithAuthorData = async () => {
  if (!db) return [];
  try {
    const q = query(
      collection(db, "forumPosts"),
      orderBy("createdAt", "desc")
    );
    const snapshot = await getDocs(q);
    
    const postsWithAuthorData = await Promise.all(
      snapshot.docs.map(async (doc) => {
        const postData = doc.data();
        const authorData = await getUserProfile(postData.authorId);
        const comments = await getCommentsForPostWithUserData(doc.id);
        
        return {
          id: doc.id,
          ...postData,
          createdAt: postData.createdAt?.toDate(),
          updatedAt: postData.updatedAt?.toDate(),
          author: authorData?.displayName || "Anonymous",
          authorId: postData.authorId,
          avatar: authorData?.avatar || null,
          comments: comments || [],
        };
      })
    );
    
    return postsWithAuthorData;
  } catch (error) {
    console.error("Error fetching forum posts with author data:", error);
    return [];
  }
};

// ============== ARTICLE WITH AUTHOR DATA ==============
export const getArticlesWithAuthorData = async (limit_count: number = 10) => {
  if (!db) return [];
  try {
    const q = query(
      collection(db, "articles"),
      orderBy("createdAt", "desc"),
      limit(limit_count)
    );
    const snapshot = await getDocs(q);
    
    const articlesWithAuthorData = await Promise.all(
      snapshot.docs.map(async (doc) => {
        const articleData = doc.data();
        const authorData = await getUserProfile(articleData.authorId);
        
        return {
          id: doc.id,
          ...articleData,
          createdAt: articleData.createdAt?.toDate(),
          updatedAt: articleData.updatedAt?.toDate(),
          author: authorData?.displayName || "Anonymous",
          authorId: articleData.authorId,
          authorEmail: authorData?.email,
          authorAvatar: authorData?.avatar,
        };
      })
    );
    
    return articlesWithAuthorData;
  } catch (error) {
    console.error("Error fetching articles with author data:", error);
    return [];
  }
};

// ============== KYC VERIFICATION MANAGEMENT ==============
export const getPendingKYCRequests = async () => {
  try {
    const q = query(
      collection(db, "users"),
      where("verificationStatus", "==", "pending"),
      orderBy("createdAt", "desc")
    );
    const snapshot = await getDocs(q);
    
    return snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
      createdAt: (doc.data() as any).createdAt?.toDate(),
    }));
  } catch (error) {
    console.error("Error fetching pending KYC requests:", error);
    return [];
  }
};

export const updateKYCStatus = async (userId: string, status: "verified" | "rejected", adminNotes?: string) => {
  if (!userId || !status) {
    throw new Error("User ID dan status diperlukan");
  }
  
  try {
    const userRef = doc(db, "users", userId);
    await updateDoc(userRef, {
      verificationStatus: status,
      verificationDate: serverTimestamp(),
      adminNotes: adminNotes || "",
      memberId: status === "verified" ? generateMemberId("member") : null,
    });
    
    return { success: true, message: `KYC ${status === "verified" ? "disetujui" : "ditolak"}` };
  } catch (error) {
    console.error("Error updating KYC status:", error);
    throw error;
  }
};

export const getKYCForumPosts = async () => {
  try {
    const q = query(
      collection(db, "forumPosts"),
      orderBy("timestamp", "desc")
    );
    const snapshot = await getDocs(q);
    
    const postsWithAuthorData = await Promise.all(
      snapshot.docs.map(async (doc) => {
        const postData = doc.data();
        const authorData = await getUserProfile(postData.authorId);
        
        return {
          id: doc.id,
          ...postData,
          timestamp: (postData as any).timestamp?.toDate?.(),
          author: authorData?.displayName || "Anonymous",
          authorId: postData.authorId,
          authorEmail: authorData?.email,
        };
      })
    );
    
    return postsWithAuthorData;
  } catch (error) {
    console.error("Error fetching forum posts for admin:", error);
    return [];
  }
};

export const deleteForumPostByAdmin = async (postId: string, userId: string, userRole: string) => {
  if (!postId) {
    throw new Error("Post ID diperlukan");
  }
  
  try {
    const postRef = doc(db, "forumPosts", postId);
    const postSnap = await getDoc(postRef);
    
    if (!postSnap.exists()) {
      throw new Error("Postingan tidak ditemukan");
    }
    
    const postData = postSnap.data();
    
    // Check: User is admin OR user is post author
    if (userRole !== "admin" && postData.authorId !== userId) {
      throw new Error("Anda tidak memiliki izin untuk menghapus postingan ini");
    }
    
    await deleteDoc(postRef);
    
    // Also delete associated comments
    const commentsRef = collection(postRef, "comments");
    const commentSnap = await getDocs(commentsRef);
    
    for (const comment of commentSnap.docs) {
      await deleteDoc(comment.ref);
    }
    
    return { success: true, message: "Postingan berhasil dihapus" };
  } catch (error) {
    console.error("Error deleting forum post:", error);
    throw error;
  }
};
