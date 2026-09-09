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
    addDoc,
    serverTimestamp,
    query,
    orderBy,
    onSnapshot
} from
    "https://www.gstatic.com/firebasejs/12.18.0/firebase-firestore.js";


// Firebase 설정
const firebaseConfig = {
    apiKey: "AIzaSyDmhkAhyUxGtekFLRe9AnJMQOOym867Cyc",
    authDomain: "linkup-a76c2.firebaseapp.com",
    projectId: "linkup-a76c2",
    storageBucket: "linkup-a76c2.firebasestorage.app",
    messagingSenderId: "205919612709",
    appId: "1:205919612709:web:002f5d733036629b1ab4cc"
};


// Firebase 시작
const app = initializeApp(firebaseConfig);

const auth = getAuth(app);
const db = getFirestore(app);

const provider = new GoogleAuthProvider();


// HTML 요소
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

const messagesContainer =
    document.getElementById("messages");

const messageForm =
    document.getElementById("message-form");

const messageInput =
    document.getElementById("message-input");


// Google 로그인 버튼
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


// 로그아웃 버튼
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


// 로그인 상태 변화 감지
onAuthStateChanged(
    auth,

    function(user) {

        if (user) {

            // 로그인 상태
            loginScreen.style.display = "none";

            chatContainer.style.display = "flex";

            userName.textContent =
                user.displayName;

            loadMessages();

        } else {

            // 로그아웃 상태
            loginScreen.style.display = "flex";

            chatContainer.style.display = "none";

        }

    }
);


// 메시지 전송
messageForm.addEventListener(
    "submit",

    async function(event) {

        event.preventDefault();

        const text =
            messageInput.value.trim();

        if (!text) return;


        const user =
            auth.currentUser;


        if (!user) {

            alert(
                "로그인이 필요합니다."
            );

            return;

        }


        try {

            await addDoc(
                collection(db, "messages"),

                {
                    text: text,

                    name:
                        user.displayName
                        || "사용자",

                    userId:
                        user.uid,

                    photoURL:
                        user.photoURL
                        || "",

                    createdAt:
                        serverTimestamp()

                }
            );


            messageInput.value = "";


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


// 실시간 메시지 불러오기
let unsubscribeMessages = null;

function loadMessages() {

    // 중복 실행 방지
    if (unsubscribeMessages) {
        unsubscribeMessages();
    }


    const messagesQuery = query(

        collection(db, "messages"),

        orderBy(
            "createdAt",
            "asc"
        )

    );


    unsubscribeMessages =
        onSnapshot(

            messagesQuery,

            function(snapshot) {

                messagesContainer.innerHTML = "";


                snapshot.forEach(
                    function(docSnapshot) {

                        const messageData =
                            docSnapshot.data();


                        const messageElement =
                            document.createElement(
                                "div"
                            );

                        messageElement.className =
                            "message";


                        const nameElement =
                            document.createElement(
                                "div"
                            );

                        nameElement.className =
                            "message-name";

                        nameElement.textContent =
                            messageData.name
                            || "사용자";


                        const textElement =
                            document.createElement(
                                "div"
                            );

                        textElement.textContent =
                            messageData.text;


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
