// Firebase 기능 가져오기
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


// Firebase 프로젝트 설정
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


// Authentication 연결
const auth = getAuth(app);


// Firestore 연결
const db = getFirestore(app);


// HTML 요소 가져오기
const messagesContainer = document.getElementById("messages");

const messageForm = document.getElementById("message-form");

const messageInput = document.getElementById("message-input");


// 익명 로그인
async function login() {

    try {

        await signInAnonymously(auth);

        console.log("익명 로그인 성공");

    } catch (error) {

        console.error("로그인 오류:", error);

    }

}


// 로그인 실행
login();


// 메시지 전송
messageForm.addEventListener("submit", async (event) => {

    // 페이지 새로고침 방지
    event.preventDefault();


    const text = messageInput.value.trim();


    // 빈 메시지는 전송하지 않음
    if (!text) {
        return;
    }


    try {

        // Firestore에 메시지 저장
        await addDoc(
            collection(db, "messages"),
            {
                text: text,
                name: "익명 사용자",
                userId: auth.currentUser.uid,
                createdAt: serverTimestamp()
            }
        );


        // 입력창 비우기
        messageInput.value = "";


    } catch (error) {

        console.error("메시지 전송 오류:", error);

        alert("메시지를 전송하지 못했습니다.");

    }

});


// Firestore의 메시지를 실시간으로 가져오기
const messagesQuery = query(
    collection(db, "messages"),
    orderBy("createdAt", "asc")
);


onSnapshot(messagesQuery, (snapshot) => {

    // 기존 메시지 화면 초기화
    messagesContainer.innerHTML = "";


    snapshot.forEach((document) => {

        const data = document.data();


        // 메시지 박스 생성
        const messageElement = document.createElement("div");

        messageElement.className = "message";


        // 이름
        const nameElement = document.createElement("div");

        nameElement.className = "message-name";

        nameElement.textContent = data.name;


        // 메시지 내용
        const textElement = document.createElement("div");

        textElement.textContent = data.text;


        // 화면에 추가
        messageElement.appendChild(nameElement);

        messageElement.appendChild(textElement);

        messagesContainer.appendChild(messageElement);

    });


    // 가장 최근 메시지로 자동 스크롤
    messagesContainer.scrollTop =
        messagesContainer.scrollHeight;

});