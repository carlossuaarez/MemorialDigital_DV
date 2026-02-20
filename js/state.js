const DB = "memorial_db";
const API_URL = "../server/sqlite.php";
// const API_URL = "https://public.digitalvalue.es/github/tests2/botcamp2026/MemorialDigital/server/sqlite.php";
const defaultPhoto = "./assets/defaultPfp.png";

var State = {
    access: {
        granted: false,
        code: "",
        error: "",
        isAdmin: false,
    },
    deceased: {
        id: null,
        name: "",
        birth: "",
        death: "",
        photo: defaultPhoto,
        bio: "",
        gallery: [],
        messages: []
    },
    modalImage: null,
    newAuthor: "",
    newMessage: "",
    isAdmin: false,
    inputPin: "",
    showAdminPanel: false,
    velas: 0,
    toasts: [],
    dialog: { show: false, title: "", message: "", onConfirm: null, isPrompt: false, promptValue: "" }
};