import {
    initializeApp
} from
"https://www.gstatic.com/firebasejs/12.18.0/firebase-app.js";


import {
    getAuth,
    GoogleAuthProvider,
    signInWithPopup,
    onAuthStateChanged,
    signOut
} from
"https://www.gstatic.com/firebasejs/12.18.0/firebase-auth.js";


import {
    getFirestore,
    doc,
    setDoc,
    getDoc,
    serverTimestamp
} from
"https://www.gstatic.com/firebasejs/12.18.0/firebase-firestore.js";



/* =========================
   Firebase 설정
========================= */

const firebaseConfig = {

    apiKey: "여기에_API_KEY",

    authDomain:
        "여기에.firebaseapp.com",

    projectId:
        "여기에_PROJECT_ID",

    storageBucket:
        "여기에_STORAGE_BUCKET",

    messagingSenderId:
        "여기에_MESSAGING_SENDER_ID",

    appId:
        "여기에_APP_ID"

};



/* =========================
   Firebase 시작
========================= */

const app =
    initializeApp(firebaseConfig);

const auth =
    getAuth(app);

const db =
    getFirestore(app);

const provider =
    new GoogleAuthProvider();



/* =========================
   HTML 요소
========================= */

const loginPage =
    document.getElementById("loginPage");

const mainPage =
    document.getElementById("mainPage");

const googleLoginBtn =
    document.getElementById("googleLoginBtn");

const logoutBtn =
    document.getElementById("logoutBtn");

const profileName =
    document.getElementById("profileName");

const profileEmail =
    document.getElementById("profileEmail");

const profileImage =
    document.getElementById("profileImage");

const addFriendBtn =
    document.getElementById("addFriendBtn");

const friendModal =
    document.getElementById("friendModal");

const cancelFriendBtn =
    document.getElementById("cancelFriendBtn");



/* =========================
   Google 로그인
========================= */

googleLoginBtn.addEventListener(
    "click",
    async () => {

        try {

            await signInWithPopup(
                auth,
                provider
            );

        } catch (error) {

            console.error(error);

            alert(
                "로그인에 실패했습니다."
            );

        }

    }
);



/* =========================
   로그인 상태 감지
========================= */

onAuthStateChanged(
    auth,
    async (user) => {

        if (user) {

            console.log(
                "로그인:",
                user.uid
            );

            loginPage.classList.add(
                "hidden"
            );

            mainPage.classList.remove(
                "hidden"
            );


            await createUser(user);

            showProfile(user);

        } else {

            loginPage.classList.remove(
                "hidden"
            );

            mainPage.classList.add(
                "hidden"
            );

        }

    }
);



/* =========================
   사용자 생성
========================= */

async function createUser(user) {

    const userRef =
        doc(
            db,
            "users",
            user.uid
        );


    const userSnapshot =
        await getDoc(userRef);


    if (!userSnapshot.exists()) {

        await setDoc(
            userRef,
            {

                uid: user.uid,

                name:
                    user.displayName ||
                    "사용자",

                email:
                    user.email || "",

                photoURL:
                    user.photoURL || "",

                createdAt:
                    serverTimestamp()

            }
        );

        console.log(
            "사용자 정보 저장 완료"
        );

    }

}



/* =========================
   프로필 표시
========================= */

function showProfile(user) {

    profileName.textContent =
        user.displayName ||
        "사용자";


    profileEmail.textContent =
        user.email ||
        "";


    if (user.photoURL) {

        profileImage.src =
            user.photoURL;

    }

}



/* =========================
   로그아웃
========================= */

logoutBtn.addEventListener(
    "click",
    async () => {

        try {

            await signOut(auth);

        } catch (error) {

            console.error(error);

        }

    }
);



/* =========================
   친구 추가 모달
========================= */

addFriendBtn.addEventListener(
    "click",
    () => {

        friendModal.classList.remove(
            "hidden"
        );

    }
);


cancelFriendBtn.addEventListener(
    "click",
    () => {

        friendModal.classList.add(
            "hidden"
        );

    }
);
