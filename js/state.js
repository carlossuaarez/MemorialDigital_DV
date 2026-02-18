const DB = "memorial_db";
const API_URL = "../server/sqlite.php"; 

var State = {
    access: {
        granted: false,
        code: "",
        error: ""
    },
    deceased: {
        id: null, 
        name: "",
        birth: "",
        death: "",
        photo: "https://pro.campus.sanofi/.imaging/mte/portal/256/dam/Portal/Spain/articulos/dislipemia/whats-next-2024/perfil.png/jcr:content/perfil.png",
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