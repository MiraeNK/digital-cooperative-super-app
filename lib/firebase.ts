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
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

// Validate that Firebase config is properly loaded
const isConfigValid = Boolean(
  firebaseConfig.apiKey && 
  firebaseConfig.authDomain && 
  firebaseConfig.projectId
);

let app: any = null;
let auth: any = null;
let db: any = null;
let googleProvider: any = null;

if (isConfigValid) {
  try {
    app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
    auth = getAuth(app);
    db = getFirestore(app);
    googleProvider = new GoogleAuthProvider();
    console.log("[Firebase] Initialized successfully");
  } catch (error) {
    console.error("[Firebase] Initialization error:", error);
  }
} else {
  console.warn("[Firebase] Configuration incomplete - running in dev mode without backend");
}

export { auth, db, googleProvider };

// Fungsi helper simpan user
export const createUserProfile = async (user: any, name: string) => {
  if (!user || !db) return;
  
  const userRef = doc(db, "users", user.uid);
  const userData = {
    email: user.email,
    displayName: name,
    role: "member",
    createdAt: serverTimestamp(),
  };
  
  await setDoc(userRef, userData);
};

// Get user profile
export const getUserProfile = async (uid: string) => {
  if (!db) return null;
  const userRef = doc(db, "users", uid);
  const userSnap = await getDoc(userRef);
  if (userSnap.exists()) return userSnap.data();
  return null;
};

// Update user profile data
export const updateUserProfileData = async (uid: string, data: any) => {
  if (!db) throw new Error("Database not initialized");
  const userRef = doc(db, "users", uid);
  await updateDoc(userRef, data);
};

// Create article
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

// Get articles with pagination
export const getArticles = async (limit_count: number = 10) => {
  if (!db) return [];
  try {
    const q = query(
      collection(db, "articles"),
      orderBy("createdAt", "desc"),
      limit(limit_count)
    );
    const snapshot = await getDocs(q);
    return snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));
  } catch (error) {
    console.error("Error fetching articles:", error);
    return [];
  }
};

// Get article by ID
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

// Get articles by author
export const getArticlesByAuthor = async (authorId: string) => {
  if (!db) return [];
  try {
    const q = query(
      collection(db, "articles"),
      where("authorId", "==", authorId),
      orderBy("createdAt", "desc")
    );
    const snapshot = await getDocs(q);
    return snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));
  } catch (error) {
    console.error("Error fetching author articles:", error);
    return [];
  }
};

// Update article
export const updateArticle = async (articleId: string, data: any) => {
  if (!db) throw new Error("Database not initialized");
  try {
    const docRef = doc(db, "articles", articleId);
    await updateDoc(docRef, {
      ...data,
      updatedAt: serverTimestamp(),
    });
  } catch (error) {
    console.error("Error updating article:", error);
    throw error;
  }
};

// Delete article
export const deleteArticle = async (articleId: string) => {
  if (!db) throw new Error("Database not initialized");
  try {
    await deleteDoc(doc(db, "articles", articleId));
  } catch (error) {
    console.error("Error deleting article:", error);
    throw error;
  }
};

// Create forum post
export const createForumPost = async (userId: string, postData: any) => {
  if (!db) throw new Error("Database not initialized");
  try {
    const docRef = await addDoc(collection(db, "forumPosts"), {
      ...postData,
      userId,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
      upvotes: 0,
      downvotes: 0,
    });
    return docRef.id;
  } catch (error) {
    console.error("Error creating forum post:", error);
    throw error;
  }
};

// Get forum posts
export const getForumPosts = async () => {
  if (!db) return [];
  try {
    const q = query(
      collection(db, "forumPosts"),
      orderBy("createdAt", "desc")
    );
    const snapshot = await getDocs(q);
    return snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));
  } catch (error) {
    console.error("Error fetching forum posts:", error);
    return [];
  }
};

// Get forum post by ID
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

// Update forum post
export const updateForumPost = async (postId: string, data: any) => {
  if (!db) throw new Error("Database not initialized");
  try {
    const docRef = doc(db, "forumPosts", postId);
    await updateDoc(docRef, {
      ...data,
      updatedAt: serverTimestamp(),
    });
  } catch (error) {
    console.error("Error updating forum post:", error);
    throw error;
  }
};

// Delete forum post
export const deleteForumPost = async (postId: string) => {
  if (!db) throw new Error("Database not initialized");
  try {
    await deleteDoc(doc(db, "forumPosts", postId));
  } catch (error) {
    console.error("Error deleting forum post:", error);
    throw error;
  }
};

// Add comment to post
export const addCommentToPost = async (postId: string, userId: string, content: string) => {
  if (!db) throw new Error("Database not initialized");
  try {
    // Validate required fields
    if (!postId || !userId || !content) {
      throw new Error(`Missing required fields: postId=${postId}, userId=${userId}, content=${content}`);
    }

    const docRef = await addDoc(collection(db, `forumPosts/${postId}/comments`), {
      userId,
      content,
      createdAt: serverTimestamp(),
    });

    const postRef = doc(db, "forumPosts", postId);
    await updateDoc(postRef, {
      commentCount: (await getDoc(postRef)).data()?.commentCount || 0 + 1,
    });

    return docRef.id;
  } catch (error) {
    console.error("Error adding comment:", error);
    throw error;
  }
};

// Get comments for post
export const getCommentsForPost = async (postId: string) => {
  if (!db) return [];
  try {
    const q = query(
      collection(db, `forumPosts/${postId}/comments`),
      orderBy("createdAt", "desc")
    );
    const snapshot = await getDocs(q);
    return snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));
  } catch (error) {
    console.error("Error fetching comments:", error);
    return [];
  }
};

// Delete comment
export const deleteComment = async (postId: string, commentId: string) => {
  if (!db) throw new Error("Database not initialized");
  try {
    await deleteDoc(doc(db, `forumPosts/${postId}/comments`, commentId));
  } catch (error) {
    console.error("Error deleting comment:", error);
    throw error;
  }
};

// Send message
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

    // Update chat list for both users
    const senderChatRef = doc(db, "chats", senderId, "chats", receiverId);
    const receiverChatRef = doc(db, "chats", receiverId, "chats", senderId);

    await setDoc(senderChatRef, {
      lastMessage: text,
      lastMessageTime: serverTimestamp(),
      unread: false,
    }, { merge: true });

    await setDoc(receiverChatRef, {
      lastMessage: text,
      lastMessageTime: serverTimestamp(),
      unread: true,
    }, { merge: true });

    return messageRef.id;
  } catch (error) {
    console.error("Error sending message:", error);
    throw error;
  }
};

// Get conversation between two users
export const getConversation = async (userId1: string, userId2: string) => {
  if (!db) return [];
  try {
    const q = query(
      collection(db, "messages"),
      where("senderId", "in", [userId1, userId2]),
      orderBy("timestamp", "asc")
    );
    const snapshot = await getDocs(q);
    return snapshot.docs
      .filter(doc => (doc.data().senderId === userId1 && doc.data().receiverId === userId2) ||
                      (doc.data().senderId === userId2 && doc.data().receiverId === userId1))
      .map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
  } catch (error) {
    console.error("Error fetching conversation:", error);
    return [];
  }
};

// Mark message as read
export const markMessageAsRead = async (messageId: string) => {
  if (!db) throw new Error("Database not initialized");
  try {
    const docRef = doc(db, "messages", messageId);
    await updateDoc(docRef, { read: true });
  } catch (error) {
    console.error("Error marking message as read:", error);
    throw error;
  }
};

// Get all members
export const getAllMembers = async () => {
  if (!db) return [];
  try {
    const q = query(collection(db, "users"), where("role", "==", "member"));
    const snapshot = await getDocs(q);
    return snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));
  } catch (error) {
    console.error("Error fetching members:", error);
    return [];
  }
};

// Get member stats
export const getMemberStats = async () => {
  if (!db) return { totalMembers: 0, totalWriters: 0, activeMembers: 0 };
  try {
    const memberQuery = query(collection(db, "users"), where("role", "==", "member"));
    const writerQuery = query(collection(db, "users"), where("role", "==", "writer"));
    
    const memberSnap = await getDocs(memberQuery);
    const writerSnap = await getDocs(writerQuery);
    
    return {
      totalMembers: memberSnap.size,
      totalWriters: writerSnap.size,
      activeMembers: memberSnap.docs.filter(doc => doc.data().online).length,
    };
  } catch (error) {
    console.error("Error fetching stats:", error);
    return { totalMembers: 0, totalWriters: 0, activeMembers: 0 };
  }
};

// Vote on post
export const voteOnPost = async (postId: string, userId: string, voteType: "upvote" | "downvote") => {
  if (!db) throw new Error("Database not initialized");
  try {
    const postRef = doc(db, "forumPosts", postId);
    const voteField = voteType === "upvote" ? "upvotes" : "downvotes";
    await updateDoc(postRef, {
      [voteField]: arrayUnion(userId),
    });
  } catch (error) {
    console.error("Error voting on post:", error);
    throw error;
  }
};

// Get user by ID
export const getUserById = async (userId: string) => {
  if (!db) return null;
  try {
    const userRef = doc(db, "users", userId);
    const userSnap = await getDoc(userRef);
    if (userSnap.exists()) {
      return { id: userSnap.id, ...userSnap.data() };
    }
    return null;
  } catch (error) {
    console.error("Error fetching user:", error);
    return null;
  }
};

// Send friend request
export const sendFriendRequest = async (senderId: string, receiverId: string) => {
  if (!db) throw new Error("Database not initialized");
  try {
    // Check if already friends or request exists
    const userRef = doc(db, "users", receiverId);
    const userData = (await getDoc(userRef)).data();
    
    if (userData?.friends?.includes(senderId)) {
      throw new Error("Already friends");
    }
    
    // Add to pending requests
    await updateDoc(userRef, {
      pendingRequests: arrayUnion(senderId),
    });
  } catch (error) {
    console.error("Error sending friend request:", error);
    throw error;
  }
};

// Accept friend request
export const acceptFriendRequest = async (userId: string, friendId: string) => {
  if (!db) throw new Error("Database not initialized");
  try {
    const userRef = doc(db, "users", userId);
    const friendRef = doc(db, "users", friendId);
    
    await updateDoc(userRef, {
      friends: arrayUnion(friendId),
      pendingRequests: arrayRemove(friendId),
    });
    
    await updateDoc(friendRef, {
      friends: arrayUnion(userId),
    });
  } catch (error) {
    console.error("Error accepting friend request:", error);
    throw error;
  }
};

// Reject friend request
export const rejectFriendRequest = async (userId: string, friendId: string) => {
  if (!db) throw new Error("Database not initialized");
  try {
    const userRef = doc(db, "users", userId);
    await updateDoc(userRef, {
      pendingRequests: arrayRemove(friendId),
    });
  } catch (error) {
    console.error("Error rejecting friend request:", error);
    throw error;
  }
};

// Get user friends
export const getUserFriends = async (userId: string) => {
  if (!db) return [];
  try {
    const userRef = doc(db, "users", userId);
    const userData = (await getDoc(userRef)).data();
    return userData?.friends || [];
  } catch (error) {
    console.error("Error fetching friends:", error);
    return [];
  }
};

// Get pending friend requests
export const getPendingFriendRequests = async (userId: string) => {
  if (!db) return [];
  try {
    const userRef = doc(db, "users", userId);
    const userData = (await getDoc(userRef)).data();
    const pendingIds = userData?.pendingRequests || [];
    
    const requests = await Promise.all(
      pendingIds.map(async (id: string) => {
        const userData = await getUserProfile(id);
        return { id, ...userData };
      })
    );
    
    return requests;
  } catch (error) {
    console.error("Error fetching pending requests:", error);
    return [];
  }
};

// Search users
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
    return snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));
  } catch (error) {
    console.error("Error searching users:", error);
    return [];
  }
};

// Get pending messages
export const getPendingMessages = async (userId: string) => {
  if (!db) return [];
  try {
    const userRef = doc(db, "users", userId);
    const userData = (await getDoc(userRef)).data();
    const pendingMessageIds = userData?.pendingMessages || [];
    
    const messages = await Promise.all(
      pendingMessageIds.map(async (msgId: string) => {
        const msgRef = doc(db, "messages", msgId);
        const msgData = (await getDoc(msgRef)).data();
        const senderData = await getUserProfile(msgData?.senderId);
        return {
          id: msgId,
          ...msgData,
          senderData,
        };
      })
    );
    
    return messages;
  } catch (error) {
    console.error("Error fetching pending messages:", error);
    return [];
  }
};

// Set user online
export const setUserOnline = async (userId: string) => {
  if (!db) return false;
  try {
    const userRef = doc(db, "users", userId);
    await updateDoc(userRef, { online: true, lastSeen: serverTimestamp() });
    return true;
  } catch (error) {
    console.error("Error setting user online:", error);
    return false;
  }
};

// Set user offline
export const setUserOffline = async (userId: string) => {
  if (!db) return false;
  try {
    const userRef = doc(db, "users", userId);
    await updateDoc(userRef, { online: false, lastSeen: serverTimestamp() });
    return true;
  } catch (error) {
    console.error("Error setting user offline:", error);
    return false;
  }
};

// Send message with friend check
export const sendMessageWithFriendCheck = async (senderId: string, receiverId: string, text: string) => {
  if (!db) throw new Error("Database not initialized");
  try {
    // Check if receiver exists
    const receiverRef = doc(db, "users", receiverId);
    const receiverSnap = await getDoc(receiverRef);
    
    if (!receiverSnap.exists()) {
      throw new Error("Receiver not found");
    }
    
    // Check if friends
    const senderRef = doc(db, "users", senderId);
    const senderData = (await getDoc(senderRef)).data();
    const isFriend = senderData?.friends?.includes(receiverId);
    
    // Send message
    const messageRef = await addDoc(collection(db, "messages"), {
      senderId,
      receiverId,
      text,
      timestamp: serverTimestamp(),
      read: false,
    });
    
    // If not friends, add to pending messages for receiver
    if (!isFriend) {
      await updateDoc(receiverRef, {
        pendingMessages: arrayUnion(messageRef.id),
      });
    }
    
    return messageRef.id;
  } catch (error) {
    console.error("Error sending message with friend check:", error);
    throw error;
  }
};

// Get articles by tag
export const getArticlesByTag = async (tag: string) => {
  if (!db) return [];
  try {
    const q = query(
      collection(db, "articles"),
      where("tags", "array-contains", tag),
      orderBy("createdAt", "desc")
    );
    const snapshot = await getDocs(q);
    return snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));
  } catch (error) {
    console.error("Error fetching articles by tag:", error);
    return [];
  }
};

// Get all article tags
export const getAllArticleTags = async () => {
  if (!db) return [];
  try {
    const snapshot = await getDocs(collection(db, "articles"));
    const tags = new Set<string>();
    snapshot.docs.forEach(doc => {
      const articleTags = doc.data().tags || [];
      articleTags.forEach((tag: string) => tags.add(tag));
    });
    return Array.from(tags);
  } catch (error) {
    console.error("Error fetching all tags:", error);
    return [];
  }
};

// Get user chats
export const getUserChats = async (userId: string) => {
  if (!db) return [];
  try {
    const q = query(
      collection(db, "messages"),
      where("senderId", "==", userId),
      orderBy("timestamp", "desc"),
      limit(50)
    );
    const snapshot = await getDocs(q);
    
    // Group by receiver
    const chatsMap = new Map();
    for (const doc of snapshot.docs) {
      const data = doc.data();
      const chatKey = data.receiverId;
      if (!chatsMap.has(chatKey)) {
        const userProfile = await getUserProfile(data.receiverId);
        chatsMap.set(chatKey, {
          userId: data.receiverId,
          displayName: userProfile?.displayName || "User",
          email: userProfile?.email || "",
          lastMessage: data.text,
          lastMessageTime: data.timestamp,
          read: data.read,
        });
      }
    }
    
    return Array.from(chatsMap.values());
  } catch (error) {
    console.error("Error fetching user chats:", error);
    return [];
  }
};

// Get forum posts with author data
export const getForumPostsWithAuthorData = async () => {
  if (!db) return [];
  try {
    const q = query(
      collection(db, "forumPosts"),
      orderBy("createdAt", "desc")
    );
    const snapshot = await getDocs(q);
    
    const posts = await Promise.all(
      snapshot.docs.map(async (doc) => {
        const data = doc.data();
        const authorData = await getUserProfile(data.userId);
        return {
          id: doc.id,
          ...data,
          authorData,
        };
      })
    );
    
    return posts;
  } catch (error) {
    console.error("Error fetching forum posts with author data:", error);
    return [];
  }
};

// Get articles with author data
export const getArticlesWithAuthorData = async (limit_count: number = 10) => {
  if (!db) return [];
  try {
    const q = query(
      collection(db, "articles"),
      orderBy("createdAt", "desc"),
      limit(limit_count)
    );
    const snapshot = await getDocs(q);
    
    const articles = await Promise.all(
      snapshot.docs.map(async (doc) => {
        const data = doc.data();
        const authorData = await getUserProfile(data.authorId);
        return {
          id: doc.id,
          ...data,
          authorData,
        };
      })
    );
    
    return articles;
  } catch (error) {
    console.error("Error fetching articles with author data:", error);
    return [];
  }
};
