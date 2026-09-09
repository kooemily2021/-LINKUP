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
    addDoc,
    query,
    where,
    onSnapshot,
    serverTimestamp
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


// ========================================
// 로그인
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
// 로그인 상태 확인
// ========================================

onAuthStateChanged(
    auth,

    async function(user) {

        if (user) {

            loginScreen.style.display = "none";

            chatContainer.style.display = "flex";

            userName.textContent =
                user.displayName || "사용자";

            // 사용자 정보 저장
            await saveUser(user);

            // 친구 요청 불러오기
            loadFriendRequests();

            // 친구 목록 불러오기
            loadFriends();

        } else {

            loginScreen.style.display = "flex";

            chatContainer.style.display = "none";

        }

    }
);


// ========================================
// 사용자 정보 저장
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

        const usersQuery = query(
            collection(db, "users")
        );


        const snapshot =
            await getDoc(
                doc(
                    db,
                    "users",
                    currentUser.uid
                )
            );


        // 전체 users 조회
        const allUsers =
            await new Promise(
                function(resolve, reject) {

                    const unsubscribe =
                        onSnapshot(
                            usersQuery,
                            function(snapshot) {

                                unsubscribe();

                                resolve(snapshot);

                            },
                            function(error) {

                                reject(error);

                            }
                        );

                }
            );


        let found = false;


        allUsers.forEach(
            function(userDoc) {

                const userData =
                    userDoc.data();


                if (
                    userData.uid === currentUser.uid
                ) {
                    return;
                }


                const name =
                    (userData.name || "")
                    .toLowerCase();

                const email =
                    (userData.email || "")
                    .toLowerCase();


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

    } catch (error) {

        console.error(
            "친구 검색 오류:",
            error
        );

        searchResults.innerHTML =
            "<p>검색에 실패했습니다.</p>";

    }

}


// ========================================
// 검색 결과 UI
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
            ${escapeHTML(userData.name || "사용자")}
        </strong>

        <small>
            ${escapeHTML(userData.email || "")}
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
// 친구 요청 보내기
// ========================================

async function sendFriendRequest(targetUser) {

    const currentUser =
        auth.currentUser;


    if (!currentUser) return;


    try {

        // 요청 ID
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

let unsubscribeRequests =
    null;


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

        // 내 친구 목록에 추가
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


        // 상대방 친구 목록에도 추가
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

let unsubscribeFriends =
    null;


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


                        chatButton.addEventListener(
                            "click",
                            function() {

                                alert(
                                    "다음 단계에서 채팅방을 연결합니다."
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
// HTML 특수문자 처리
// ========================================

function escapeHTML(text) {

    const div =
        document.createElement("div");

    div.textContent =
        text;

    return div.innerHTML;

}
