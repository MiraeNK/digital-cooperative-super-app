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

// ============== USER ==============

export const createUserProfile = async (user: any, name: string) => {
  if (!user || !db) return;
  const userRef = doc(db, "users", user.uid);
  const userData = {
    email: user.email,
    displayName: name,
    role: "member",
    createdAt: serverTimestamp(),
  };
  await setDoc(userRef, userData, { merge: true });
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
  await updateDoc(userRef, data);
};

export const getUserById = async (userId: string) => {
  if (!db) return null;
  try {
    const userRef = doc(db, "users", userId);
    const userSnap = await getDoc(userRef);
    if (userSnap.exists()) return { id: userSnap.id, ...userSnap.data() };
    return null;
  } catch (error) {
    console.error("Error fetching user:", error);
    return null;
  }
};

export const getAllMembers = async () => {
  if (!db) return [];
  try {
    const q = query(collection(db, "users"), where("role", "==", "member"));
    const snapshot = await getDocs(q);
    return snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
  } catch (error) {
    console.error("Error fetching members:", error);
    return [];
  }
};

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

export const generateMemberId = (role: "admin" | "member" | "writer" = "member") => {
  const rolePrefix = role === "admin" ? "ADM" : role === "writer" ? "WRT" : "MBR";
  const now = new Date();
  const datePart = `${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, "0")}${String(now.getDate()).padStart(2, "0")}`;
  const randomPart = Math.random().toString().slice(2, 6);
  return `${rolePrefix}-${datePart}-${randomPart}`;
};

export const getWriterStats = async (authorId: string) => {
  if (!db) return { totalArticles: 0, totalViews: 0, totalLikes: 0, averageViewsPerArticle: 0 };
  try {
    const articles = await getArticlesByAuthor(authorId);
    const totalArticles = articles.length;
    const totalViews = articles.reduce((sum, article: any) => sum + Number(article.views || 0), 0);
    const totalLikes = articles.reduce((sum, article: any) => sum + Number(article.likes || 0), 0);
    return {
      totalArticles,
      totalViews,
      totalLikes,
      averageViewsPerArticle: totalArticles > 0 ? Math.round(totalViews / totalArticles) : 0,
    };
  } catch (error) {
    console.error("Error fetching writer stats:", error);
    return { totalArticles: 0, totalViews: 0, totalLikes: 0, averageViewsPerArticle: 0 };
  }
};

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

export const searchUsers = async (searchQuery: string) => {
  if (!db) return [];
  try {
    if (!searchQuery.trim()) return [];
    const q = query(
      collection(db, "users"),
      where("displayName", ">=", searchQuery),
      where("displayName", "<=", searchQuery + "\uf8ff")
    );
    const snapshot = await getDocs(q);
    return snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
  } catch (error) {
    console.error("Error searching users:", error);
    return [];
  }
};

// ============== FRIENDS ==============

export const sendFriendRequest = async (senderId: string, receiverId: string) => {
  if (!db) throw new Error("Database not initialized");
  try {
    const userRef = doc(db, "users", receiverId);
    const userData = (await getDoc(userRef)).data();
    if (userData?.friends?.includes(senderId)) throw new Error("Already friends");
    await updateDoc(userRef, { pendingRequests: arrayUnion(senderId) });
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
    await updateDoc(userRef, {
      friends: arrayUnion(friendId),
      pendingRequests: arrayRemove(friendId),
    });
    await updateDoc(friendRef, { friends: arrayUnion(userId) });
  } catch (error) {
    console.error("Error accepting friend request:", error);
    throw error;
  }
};

export const rejectFriendRequest = async (userId: string, friendId: string) => {
  if (!db) throw new Error("Database not initialized");
  try {
    const userRef = doc(db, "users", userId);
    await updateDoc(userRef, { pendingRequests: arrayRemove(friendId) });
  } catch (error) {
    console.error("Error rejecting friend request:", error);
    throw error;
  }
};

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

// ============== ARTICLES ==============

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
    return snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
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
    if (docSnap.exists()) return { id: docSnap.id, ...docSnap.data() };
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
    return snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
  } catch (error) {
    console.error("Error fetching author articles:", error);
    return [];
  }
};

export const updateArticle = async (articleId: string, data: any) => {
  if (!db) throw new Error("Database not initialized");
  try {
    const docRef = doc(db, "articles", articleId);
    await updateDoc(docRef, { ...data, updatedAt: serverTimestamp() });
  } catch (error) {
    console.error("Error updating article:", error);
    throw error;
  }
};

export const deleteArticle = async (articleId: string) => {
  if (!db) throw new Error("Database not initialized");
  try {
    await deleteDoc(doc(db, "articles", articleId));
  } catch (error) {
    console.error("Error deleting article:", error);
    throw error;
  }
};

export const getArticlesByTag = async (tag: string) => {
  if (!db) return [];
  try {
    const q = query(
      collection(db, "articles"),
      where("tags", "array-contains", tag),
      orderBy("createdAt", "desc")
    );
    const snapshot = await getDocs(q);
    return snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
  } catch (error) {
    console.error("Error fetching articles by tag:", error);
    return [];
  }
};

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
        return { id: doc.id, ...data, authorData };
      })
    );
    return articles;
  } catch (error) {
    console.error("Error fetching articles with author data:", error);
    return [];
  }
};

// ============== FORUM POSTS ==============

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

export const getForumPosts = async () => {
  if (!db) return [];
  try {
    const q = query(collection(db, "forumPosts"), orderBy("createdAt", "desc"));
    const snapshot = await getDocs(q);
    return snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
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
    if (docSnap.exists()) return { id: docSnap.id, ...docSnap.data() };
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
    await updateDoc(docRef, { ...data, updatedAt: serverTimestamp() });
  } catch (error) {
    console.error("Error updating forum post:", error);
    throw error;
  }
};

export const deleteForumPost = async (postId: string) => {
  if (!db) throw new Error("Database not initialized");
  try {
    await deleteDoc(doc(db, "forumPosts", postId));
  } catch (error) {
    console.error("Error deleting forum post:", error);
    throw error;
  }
};

export const getForumPostsWithAuthorData = async () => {
  if (!db) return [];
  try {
    const q = query(collection(db, "forumPosts"), orderBy("createdAt", "desc"));
    const snapshot = await getDocs(q);
    const posts = await Promise.all(
      snapshot.docs.map(async (doc) => {
        const data = doc.data();
        const authorData = await getUserProfile(data.userId);
        return { id: doc.id, ...data, authorData };
      })
    );
    return posts;
  } catch (error) {
    console.error("Error fetching forum posts with author data:", error);
    return [];
  }
};

export const voteOnPost = async (postId: string, userId: string, voteType: "upvote" | "downvote") => {
  if (!db) throw new Error("Database not initialized");
  try {
    const postRef = doc(db, "forumPosts", postId);
    const voteField = voteType === "upvote" ? "upvotes" : "downvotes";
    await updateDoc(postRef, { [voteField]: arrayUnion(userId) });
  } catch (error) {
    console.error("Error voting on post:", error);
    throw error;
  }
};

// ============== COMMENTS ==============

export const addCommentToPost = async (postId: string, userId: string, content: string) => {
  if (!db) throw new Error("Database not initialized");
  try {
    if (!postId || !userId || !content) {
      throw new Error(`Missing required fields: postId=${postId}, userId=${userId}, content=${content}`);
    }
    const docRef = await addDoc(collection(db, `forumPosts/${postId}/comments`), {
      userId,
      content,
      createdAt: serverTimestamp(),
    });
    const postRef = doc(db, "forumPosts", postId);
    const postSnap = await getDoc(postRef);
    await updateDoc(postRef, {
      commentCount: (postSnap.data()?.commentCount ?? 0) + 1,
    });
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
    return snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
  } catch (error) {
    console.error("Error fetching comments:", error);
    return [];
  }
};

export const deleteComment = async (postId: string, commentId: string) => {
  if (!db) throw new Error("Database not initialized");
  try {
    await deleteDoc(doc(db, `forumPosts/${postId}/comments`, commentId));
  } catch (error) {
    console.error("Error deleting comment:", error);
    throw error;
  }
};

// ============== MESSAGING ==============

export const sendMessage = async (senderId: string, receiverId: string, text: string) => {
  if (!db) throw new Error("Database not initialized");
  try {
    const messageRef = await addDoc(collection(db, "messages"), {
      senderId,
      receiverId,
      text,
      timestamp: serverTimestamp(),
      read: false,
    });
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

export const sendMessageWithFriendCheck = async (senderId: string, receiverId: string, text: string) => {
  if (!db) throw new Error("Database not initialized");
  try {
    const receiverRef = doc(db, "users", receiverId);
    const receiverSnap = await getDoc(receiverRef);
    if (!receiverSnap.exists()) throw new Error("Receiver not found");

    const senderRef = doc(db, "users", senderId);
    const senderData = (await getDoc(senderRef)).data();
    const isFriend = senderData?.friends?.includes(receiverId);

    const messageRef = await addDoc(collection(db, "messages"), {
      senderId,
      receiverId,
      text,
      timestamp: serverTimestamp(),
      read: false,
    });

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

    if (!isFriend) {
      await updateDoc(receiverRef, { pendingMessages: arrayUnion(messageRef.id) });
    }
    return messageRef.id;
  } catch (error) {
    console.error("Error sending message with friend check:", error);
    throw error;
  }
};

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
      .filter(doc =>
        (doc.data().senderId === userId1 && doc.data().receiverId === userId2) ||
        (doc.data().senderId === userId2 && doc.data().receiverId === userId1)
      )
      .map((doc) => ({ id: doc.id, ...doc.data() }));
  } catch (error) {
    console.error("Error fetching conversation:", error);
    return [];
  }
};

export const getMessagesWithUserData = async (userId1: string, userId2: string) => {
  try {
    const messages = await getConversation(userId1, userId2);
    const user2Data = await getUserProfile(userId2);
    return {
      messages,
      otherUser: { id: userId2, ...user2Data },
    };
  } catch (error) {
    console.error("Error fetching messages with user data:", error);
    return { messages: [], otherUser: null };
  }
};

export const getUserChats = async (userId: string) => {
  if (!db) return [];
  try {
    const q = query(collection(db, "chats", userId, "chats"));
    const snapshot = await getDocs(q);
    const chatsList = await Promise.all(
      snapshot.docs.map(async (docSnap) => {
        const data = docSnap.data();
        const receiverId = docSnap.id;
        const userProfile = await getUserProfile(receiverId);
        return {
          userId: receiverId,
          displayName: userProfile?.displayName || "User",
          email: userProfile?.email || "",
          lastMessage: data.lastMessage,
          lastMessageTime: data.lastMessageTime,
          read: !data.unread,
        };
      })
    );
    return chatsList.sort((a, b) => {
      const timeA = a.lastMessageTime?.toMillis?.() || 0;
      const timeB = b.lastMessageTime?.toMillis?.() || 0;
      return timeB - timeA;
    });
  } catch (error) {
    console.error("Error fetching user chats:", error);
    return [];
  }
};

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

export const getPendingMessages = async (userId: string) => {
  if (!db) return [];
  try {
    const userRef = doc(db, "users", userId);
    const userData = (await getDoc(userRef)).data();
    const pendingMessageIds = userData?.pendingMessages || [];
    const messages = await Promise.all(
      pendingMessageIds.map(async (msgId: string) => {
        const msgRef = doc(db, "messages", msgId);
        const msgSnap = await getDoc(msgRef);
        const msgData = msgSnap.data() as any;
        const senderData = await getUserProfile(msgData?.senderId);
        return {
          id: msgId,
          senderId: msgData?.senderId || "",
          receiverId: msgData?.receiverId || "",
          text: msgData?.text || "",
          timestamp: msgData?.timestamp || null,
          read: msgData?.read || false,
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

// ============== ADMIN FUNCTIONS ==============

export const getPendingKYCRequests = async () => {
  if (!db) return [];
  try {
    const q = query(
      collection(db, "users"),
      where("verificationStatus", "in", ["pending", "verified"])
    );
    const snapshot = await getDocs(q);
    return snapshot.docs.map((docSnap) => {
      const data: any = docSnap.data();
      return {
        id: docSnap.id,
        ...data,
        createdAt: data.createdAt?.toDate?.() ?? null,
        verificationDate: data.verificationDate?.toDate?.() ?? null,
      };
    });
  } catch (error) {
    console.error("Error fetching pending KYC requests:", error);
    return [];
  }
};

export const updateKYCStatus = async (
  memberId: string,
  status: "verified" | "rejected" | "pending",
  adminNotes: string
) => {
  if (!db) throw new Error("Database not initialized");
  try {
    const userRef = doc(db, "users", memberId);
    const userSnap = await getDoc(userRef);
    const userData: any = userSnap.exists() ? userSnap.data() : {};

    const payload: any = {
      verificationStatus: status,
      verificationDate: serverTimestamp(),
      adminNotes: adminNotes || "",
    };

    if (status === "verified" && !userData?.memberId) {
      payload.memberId = generateMemberId(userData?.role || "member");
    }

    await updateDoc(userRef, payload);
  } catch (error) {
    console.error("Error updating KYC status:", error);
    throw error;
  }
};

export const getKYCForumPosts = async () => {
  if (!db) return [];
  try {
    const q = query(
      collection(db, "forumPosts"),
      orderBy("createdAt", "desc")
    );
    const snapshot = await getDocs(q);
    const posts = await Promise.all(
      snapshot.docs.map(async (docSnap) => {
        const data = docSnap.data();
        const authorData = await getUserProfile(data.userId);
        return {
          id: docSnap.id,
          ...data,
          author: authorData?.displayName || "Unknown",
          authorEmail: authorData?.email || "",
          timestamp: data.createdAt?.toDate?.() ?? null,
        };
      })
    );
    return posts;
  } catch (error) {
    console.error("Error fetching KYC forum posts:", error);
    return [];
  }
};

export const deleteForumPostByAdmin = async (
  postId: string,
  adminId: string,
  role: string
) => {
  if (!db) throw new Error("Database not initialized");
  if (role !== "admin") throw new Error("Akses ditolak: hanya admin yang bisa menghapus postingan.");
  try {
    await deleteDoc(doc(db, "forumPosts", postId));
  } catch (error) {
    console.error("Error deleting post by admin:", error);
    throw error;
  }
};
