import { initializeApp } from
    "https://www.gstatic.com/firebasejs/12.18.0/firebase-app.js";

import {
    getAuth,
    signInAnonymously
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


// HTML 요소 가져오기
const messagesContainer =
    document.getElementById("messages");

const messageForm =
    document.getElementById("message-form");

const messageInput =
    document.getElementById("message-input");


// 익명 로그인 후 채팅 기능 시작
async function startChat() {

    try {

        await signInAnonymously(auth);

        console.log("익명 로그인 성공");

        loadMessages();

    } catch (error) {

        console.error("로그인 오류:", error);

        alert("로그인에 실패했습니다.");

    }

}


// 메시지 전송
messageForm.addEventListener(
    "submit",
    async function(event) {

        event.preventDefault();

        const text = messageInput.value.trim();

        if (!text) return;


        // 로그인 완료 확인
        if (!auth.currentUser) {

            alert("로그인 중입니다. 잠시 후 다시 시도해주세요.");

            return;

        }


        try {

            await addDoc(
                collection(db, "messages"),
                {
                    text: text,
                    name: "익명 사용자",
                    userId: auth.currentUser.uid,
                    createdAt: serverTimestamp()
                }
            );


            messageInput.value = "";

        } catch (error) {

            console.error("메시지 전송 오류:", error);

            alert("메시지를 전송하지 못했습니다.");

        }

    }
);


// 실시간 메시지 불러오기
function loadMessages() {

    const messagesQuery = query(
        collection(db, "messages"),
        orderBy("createdAt", "asc")
    );


    onSnapshot(
        messagesQuery,

        function(snapshot) {

            messagesContainer.innerHTML = "";


            snapshot.forEach(function(docSnapshot) {

                const messageData =
                    docSnapshot.data();


                // 변수 이름을 document로 사용하지 않음!
                const messageElement =
                    window.document.createElement("div");


                messageElement.className =
                    "message";


                const nameElement =
                    window.document.createElement("div");


                nameElement.className =
                    "message-name";

                nameElement.textContent =
                    messageData.name;


                const textElement =
                    window.document.createElement("div");

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

            });


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


// 채팅 시작
startChat();
