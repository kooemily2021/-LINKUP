import { initializeApp } from
    "https://www.gstatic.com/firebasejs/12.18.0/firebase-app.js";

import {
    getAuth,
    GoogleAuthProvider,
    signInWithPopup,
    signOut,
    onAuthStateChanged
} from
    "https://www.gstatic.com/firebasejs/12.18.0/firebase-auth.js";

import {
    getFirestore,
    collection,
    doc,
    setDoc,
    getDoc,
    query,
    where,
    onSnapshot,
    serverTimestamp,
    addDoc,
    orderBy
} from
    "https://www.gstatic.com/firebasejs/12.18.0/firebase-firestore.js";


// ========================================
// Firebase 설정
// ========================================

const firebaseConfig = {

    apiKey: "AIzaSyDmhkAhyUxGtekFLRe9AnJMQOOym867Cyc",

    authDomain: "linkup-a76c2.firebaseapp.com",

    projectId: "linkup-a76c2",

    storageBucket: "linkup-a76c2.firebasestorage.app",

    messagingSenderId: "205919612709",

    appId: "1:205919612709:web:002f5d733036629b1ab4cc"

};


// ========================================
// Firebase 시작
// ========================================

const app = initializeApp(firebaseConfig);

const auth = getAuth(app);

const db = getFirestore(app);

const provider = new GoogleAuthProvider();


// ========================================
// HTML 요소
// ========================================

const loginScreen =
    document.getElementById("login-screen");

const chatContainer =
    document.getElementById("chat-container");

const googleLoginBtn =
    document.getElementById("google-login-btn");

const logoutBtn =
    document.getElementById("logout-btn");

const userName =
    document.getElementById("user-name");

const friendSearchInput =
    document.getElementById("friend-search-input");

const friendSearchBtn =
    document.getElementById("friend-search-btn");

const searchResults =
    document.getElementById("search-results");

const friendRequests =
    document.getElementById("friend-requests");

const friendsList =
    document.getElementById("friends-list");

const chatroomsList =
    document.getElementById("chatrooms-list");

const chatRoom =
    document.getElementById("chat-room");

const chatRoomName =
    document.getElementById("chat-room-name");

const backToFriendsBtn =
    document.getElementById("back-to-friends-btn");

const messagesContainer =
    document.getElementById("messages");

const messageForm =
    document.getElementById("message-form");

const messageInput =
    document.getElementById("message-input");


// ========================================
// 현재 채팅방
// ========================================

let currentRoomId = null;

let currentFriend = null;

let unsubscribeMessages = null;


// ========================================
// Google 로그인
// ========================================

googleLoginBtn.addEventListener(
    "click",
    async function() {

        try {

            await signInWithPopup(
                auth,
                provider
            );

        } catch (error) {

            console.error(
                "Google 로그인 오류:",
                error
            );

            alert(
                "Google 로그인에 실패했습니다."
            );

        }

    }
);


// ========================================
// 로그아웃
// ========================================

logoutBtn.addEventListener(
    "click",
    async function() {

        try {

            await signOut(auth);

        } catch (error) {

            console.error(
                "로그아웃 오류:",
                error
            );

        }

    }
);


// ========================================
// 로그인 상태
// ========================================

onAuthStateChanged(
    auth,

    async function(user) {

        if (user) {

            loginScreen.style.display = "none";

            chatContainer.style.display = "flex";

            userName.textContent =
                user.displayName || "사용자";


            await saveUser(user);

            loadFriendRequests();

            loadFriends();

        } else {

            loginScreen.style.display = "flex";

            chatContainer.style.display = "none";

            closeChatRoom();

        }

    }
);


// ========================================
// 사용자 저장
// ========================================

async function saveUser(user) {

    try {

        await setDoc(

            doc(
                db,
                "users",
                user.uid
            ),

            {

                uid:
                    user.uid,

                name:
                    user.displayName
                    || "사용자",

                email:
                    user.email
                    || "",

                photoURL:
                    user.photoURL
                    || "",

                updatedAt:
                    serverTimestamp()

            },

            {
                merge: true
            }

        );

    } catch (error) {

        console.error(
            "사용자 저장 오류:",
            error
        );

    }

}


// ========================================
// 친구 검색
// ========================================

friendSearchBtn.addEventListener(
    "click",
    searchFriends
);


friendSearchInput.addEventListener(
    "keydown",
    function(event) {

        if (event.key === "Enter") {

            event.preventDefault();

            searchFriends();

        }

    }
);


async function searchFriends() {

    const keyword =
        friendSearchInput.value.trim()
        .toLowerCase();


    searchResults.innerHTML = "";


    if (!keyword) {

        searchResults.innerHTML =
            "<p>검색어를 입력해주세요.</p>";

        return;

    }


    const currentUser =
        auth.currentUser;


    if (!currentUser) return;


    try {

        const usersQuery =
            query(
                collection(db, "users")
            );


        const unsubscribe =
            onSnapshot(

                usersQuery,

                function(snapshot) {

                    unsubscribe();

                    let found = false;


                    snapshot.forEach(
                        function(userDoc) {

                            const userData =
                                userDoc.data();


                            if (
                                userData.uid
                                ===
                                currentUser.uid
                            ) {
                                return;
                            }


                            const name =
                                (
                                    userData.name
                                    || ""
                                ).toLowerCase();


                            const email =
                                (
                                    userData.email
                                    || ""
                                ).toLowerCase();


                            if (
                                name.includes(keyword)
                                ||
                                email.includes(keyword)
                            ) {

                                found = true;

                                createSearchResult(
                                    userData
                                );

                            }

                        }
                    );


                    if (!found) {

                        searchResults.innerHTML =
                            "<p>검색 결과가 없습니다.</p>";

                    }

                },

                function(error) {

                    console.error(
                        "친구 검색 오류:",
                        error
                    );

                }

            );

    } catch (error) {

        console.error(
            "친구 검색 오류:",
            error
        );

    }

}


// ========================================
// 검색 결과
// ========================================

function createSearchResult(userData) {

    const element =
        document.createElement("div");

    element.className =
        "friend-item";


    const info =
        document.createElement("div");


    info.innerHTML = `

        <strong>
            ${escapeHTML(
                userData.name || "사용자"
            )}
        </strong>

        <small>
            ${escapeHTML(
                userData.email || ""
            )}
        </small>

    `;


    const button =
        document.createElement("button");


    button.textContent =
        "친구 요청";


    button.addEventListener(
        "click",
        function() {

            sendFriendRequest(
                userData
            );

        }
    );


    element.appendChild(info);

    element.appendChild(button);

    searchResults.appendChild(element);

}


// ========================================
// 친구 요청
// ========================================

async function sendFriendRequest(targetUser) {

    const currentUser =
        auth.currentUser;


    if (!currentUser) return;


    try {

        const requestId =
            currentUser.uid
            + "_"
            + targetUser.uid;


        await setDoc(

            doc(
                db,
                "friendRequests",
                requestId
            ),

            {

                senderId:
                    currentUser.uid,

                senderName:
                    currentUser.displayName
                    || "사용자",

                senderEmail:
                    currentUser.email
                    || "",

                receiverId:
                    targetUser.uid,

                status:
                    "pending",

                createdAt:
                    serverTimestamp()

            }

        );


        alert(
            "친구 요청을 보냈습니다."
        );


    } catch (error) {

        console.error(
            "친구 요청 오류:",
            error
        );

        alert(
            "친구 요청을 보내지 못했습니다."
        );

    }

}


// ========================================
// 받은 친구 요청
// ========================================

let unsubscribeRequests = null;


function loadFriendRequests() {

    if (unsubscribeRequests) {

        unsubscribeRequests();

    }


    const currentUser =
        auth.currentUser;


    if (!currentUser) return;


    const requestsQuery =
        query(

            collection(
                db,
                "friendRequests"
            ),

            where(
                "receiverId",
                "==",
                currentUser.uid
            ),

            where(
                "status",
                "==",
                "pending"
            )

        );


    unsubscribeRequests =
        onSnapshot(

            requestsQuery,

            function(snapshot) {

                friendRequests.innerHTML = "";


                if (snapshot.empty) {

                    friendRequests.innerHTML =
                        "<p>받은 친구 요청이 없습니다.</p>";

                    return;

                }


                snapshot.forEach(
                    function(requestDoc) {

                        const request =
                            requestDoc.data();


                        const element =
                            document.createElement(
                                "div"
                            );

                        element.className =
                            "friend-item";


                        const info =
                            document.createElement(
                                "div"
                            );


                        info.innerHTML = `

                            <strong>
                                ${escapeHTML(
                                    request.senderName
                                    || "사용자"
                                )}
                            </strong>

                            <small>
                                친구 요청
                            </small>

                        `;


                        const acceptButton =
                            document.createElement(
                                "button"
                            );


                        acceptButton.textContent =
                            "수락";


                        acceptButton.addEventListener(
                            "click",
                            function() {

                                acceptFriendRequest(
                                    requestDoc.id,
                                    request
                                );

                            }
                        );


                        element.appendChild(info);

                        element.appendChild(
                            acceptButton
                        );

                        friendRequests.appendChild(
                            element
                        );

                    }
                );

            }

        );

}


// ========================================
// 친구 요청 수락
// ========================================

async function acceptFriendRequest(
    requestId,
    request
) {

    const currentUser =
        auth.currentUser;


    if (!currentUser) return;


    try {

        // 내 친구 목록
        await setDoc(

            doc(
                db,
                "users",
                currentUser.uid,
                "friends",
                request.senderId
            ),

            {

                uid:
                    request.senderId,

                name:
                    request.senderName,

                email:
                    request.senderEmail
                    || "",

                addedAt:
                    serverTimestamp()

            }

        );


        // 상대방 정보
        const senderDoc =
            await getDoc(
                doc(
                    db,
                    "users",
                    request.senderId
                )
            );


        if (senderDoc.exists()) {

            const senderData =
                senderDoc.data();


            // 상대방 친구 목록
            await setDoc(

                doc(
                    db,
                    "users",
                    request.senderId,
                    "friends",
                    currentUser.uid
                ),

                {

                    uid:
                        currentUser.uid,

                    name:
                        currentUser.displayName
                        || "사용자",

                    email:
                        currentUser.email
                        || "",

                    addedAt:
                        serverTimestamp()

                }

            );

        }


        // 요청 상태 변경
        await setDoc(

            doc(
                db,
                "friendRequests",
                requestId
            ),

            {

                status:
                    "accepted"

            },

            {
                merge: true
            }

        );


        alert(
            "친구가 추가되었습니다!"
        );


    } catch (error) {

        console.error(
            "친구 수락 오류:",
            error
        );

        alert(
            "친구 추가에 실패했습니다."
        );

    }

}


// ========================================
// 친구 목록
// ========================================

let unsubscribeFriends = null;


function loadFriends() {

    if (unsubscribeFriends) {

        unsubscribeFriends();

    }


    const currentUser =
        auth.currentUser;


    if (!currentUser) return;


    const friendsQuery =
        collection(
            db,
            "users",
            currentUser.uid,
            "friends"
        );


    unsubscribeFriends =
        onSnapshot(

            friendsQuery,

            function(snapshot) {

                friendsList.innerHTML = "";


                if (snapshot.empty) {

                    friendsList.innerHTML =
                        "<p>친구가 없습니다.</p>";

                    return;

                }


                snapshot.forEach(
                    function(friendDoc) {

                        const friend =
                            friendDoc.data();


                        const element =
                            document.createElement(
                                "div"
                            );


                        element.className =
                            "friend-item";


                        const info =
                            document.createElement(
                                "div"
                            );


                        info.innerHTML = `

                            <strong>
                                ${escapeHTML(
                                    friend.name
                                    || "사용자"
                                )}
                            </strong>

                            <small>
                                ${escapeHTML(
                                    friend.email
                                    || ""
                                )}
                            </small>

                        `;


                        const chatButton =
                            document.createElement(
                                "button"
                            );


                        chatButton.textContent =
                            "채팅";


                        // ★ 실제 채팅방 연결
                        chatButton.addEventListener(
                            "click",
                            function() {

                                openChatRoom(
                                    friend
                                );

                            }
                        );


                        element.appendChild(info);

                        element.appendChild(
                            chatButton
                        );


                        friendsList.appendChild(
                            element
                        );

                    }
                );

            }

        );

}


// ========================================
// 1:1 채팅방 ID 생성
// ========================================

function createRoomId(uid1, uid2) {

    return [uid1, uid2]
        .sort()
        .join("_");

}


// ========================================
// 채팅방 열기
// ========================================

async function openChatRoom(friend) {

    const currentUser =
        auth.currentUser;


    if (!currentUser) {

        alert(
            "로그인이 필요합니다."
        );

        return;

    }


    try {

        currentFriend =
            friend;


        // 두 UID를 정렬해서
        // 항상 같은 채팅방 ID 사용
        const roomId =
            createRoomId(
                currentUser.uid,
                friend.uid
            );


        currentRoomId =
            roomId;


        const roomRef =
            doc(
                db,
                "chatRooms",
                roomId
            );


        const roomSnapshot =
            await getDoc(roomRef);


        // 채팅방이 없으면 생성
        if (!roomSnapshot.exists()) {

            await setDoc(

                roomRef,

                {

                    roomId:
                        roomId,

                    members: [
                        currentUser.uid,
                        friend.uid
                    ],

                    memberNames: {

                        [currentUser.uid]:
                            currentUser.displayName
                            || "사용자",

                        [friend.uid]:
                            friend.name
                            || "사용자"

                    },

                    createdAt:
                        serverTimestamp(),

                    updatedAt:
                        serverTimestamp()

                }

            );

        }


        // 친구 목록 숨기기
        document
            .querySelectorAll(
                ".friends-section, .chatrooms-section"
            )
            .forEach(
                function(element) {

                    element.style.display =
                        "none";

                }
            );


        // 채팅방 표시
        chatRoom.style.display =
            "block";


        chatRoomName.textContent =
            friend.name || "사용자";


        messagesContainer.innerHTML =
            "<p>메시지를 불러오는 중...</p>";


        loadRoomMessages(
            roomId
        );


        messageInput.focus();


    } catch (error) {

        console.error(
            "채팅방 열기 오류:",
            error
        );

        alert(
            "채팅방을 열 수 없습니다."
        );

    }

}


// ========================================
// 채팅방 메시지 실시간 불러오기
// ========================================

function loadRoomMessages(roomId) {

    if (unsubscribeMessages) {

        unsubscribeMessages();

    }


    const messagesQuery =
        query(

            collection(
                db,
                "chatRooms",
                roomId,
                "messages"
            ),

            orderBy(
                "createdAt",
                "asc"
            )

        );


    unsubscribeMessages =
        onSnapshot(

            messagesQuery,

            function(snapshot) {

                messagesContainer.innerHTML =
                    "";


                if (snapshot.empty) {

                    const emptyMessage =
                        document.createElement(
                            "p"
                        );

                    emptyMessage.textContent =
                        "아직 메시지가 없습니다.";

                    messagesContainer.appendChild(
                        emptyMessage
                    );

                    return;

                }


                snapshot.forEach(
                    function(messageDoc) {

                        const message =
                            messageDoc.data();


                        const messageElement =
                            document.createElement(
                                "div"
                            );


                        messageElement.className =
                            "message";


                        // 내 메시지 / 상대방 메시지 구분
                        if (
                            message.senderId
                            ===
                            auth.currentUser.uid
                        ) {

                            messageElement.classList.add(
                                "my-message"
                            );

                        } else {

                            messageElement.classList.add(
                                "other-message"
                            );

                        }


                        const nameElement =
                            document.createElement(
                                "div"
                            );


                        nameElement.className =
                            "message-name";


                        nameElement.textContent =
                            message.senderName
                            || "사용자";


                        const textElement =
                            document.createElement(
                                "div"
                            );


                        textElement.textContent =
                            message.text
                            || "";


                        messageElement.appendChild(
                            nameElement
                        );


                        messageElement.appendChild(
                            textElement
                        );


                        messagesContainer.appendChild(
                            messageElement
                        );

                    }
                );


                messagesContainer.scrollTop =
                    messagesContainer.scrollHeight;

            },

            function(error) {

                console.error(
                    "메시지 불러오기 오류:",
                    error
                );

            }

        );

}


// ========================================
// 메시지 전송
// ========================================

messageForm.addEventListener(
    "submit",

    async function(event) {

        event.preventDefault();


        const text =
            messageInput.value.trim();


        if (!text) return;


        const currentUser =
            auth.currentUser;


        if (
            !currentUser
            ||
            !currentRoomId
        ) {

            alert(
                "채팅방에 먼저 들어가주세요."
            );

            return;

        }


        try {

            await addDoc(

                collection(
                    db,
                    "chatRooms",
                    currentRoomId,
                    "messages"
                ),

                {

                    text:
                        text,

                    senderId:
                        currentUser.uid,

                    senderName:
                        currentUser.displayName
                        || "사용자",

                    photoURL:
                        currentUser.photoURL
                        || "",

                    createdAt:
                        serverTimestamp()

                }

            );


            // 채팅방 마지막 활동 시간
            await setDoc(

                doc(
                    db,
                    "chatRooms",
                    currentRoomId
                ),

                {

                    updatedAt:
                        serverTimestamp()

                },

                {
                    merge: true
                }

            );


            messageInput.value = "";

            messageInput.focus();


        } catch (error) {

            console.error(
                "메시지 전송 오류:",
                error
            );

            alert(
                "메시지를 전송하지 못했습니다."
            );

        }

    }
);


// ========================================
// 채팅방 닫기
// ========================================

backToFriendsBtn.addEventListener(
    "click",
    closeChatRoom
);


function closeChatRoom() {

    if (unsubscribeMessages) {

        unsubscribeMessages();

        unsubscribeMessages =
            null;

    }


    currentRoomId =
        null;

    currentFriend =
        null;


    if (chatRoom) {

        chatRoom.style.display =
            "none";

    }


    if (messagesContainer) {

        messagesContainer.innerHTML =
            "";

    }


    document
        .querySelectorAll(
            ".friends-section, .chatrooms-section"
        )
        .forEach(
            function(element) {

                element.style.display =
                    "";

            }
        );

}


// ========================================
// HTML 특수문자 처리
// ========================================

function escapeHTML(text) {

    const div =
        document.createElement("div");

    div.textContent =
        text;

    return div.innerHTML;

}

