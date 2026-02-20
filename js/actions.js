function fetchData() {
    var currentId = State.deceased.id;
    if (!currentId) return;

    m.request({
        method: "GET",
        url: `${API_URL}/rdb/${DB}/perfil/${currentId}`
    })
        .then(function (res) {
            if (res && res.items && res.items.length > 0) {
                var dbData = res.items[0];
                State.deceased.name = dbData.name || "";
                State.deceased.birth = dbData.birth || "";
                State.deceased.death = dbData.death || "";
                State.deceased.bio = dbData.bio || "";
                State.deceased.photo = dbData.photo || State.deceased.photo;
                m.redraw();
            }
        }).catch(function (e) { console.error("Error Perfil:", e); });

    Actions.loadContent(currentId);
}

function updateProfile(field, value) {
    var currentId = State.deceased.id;
    if (!currentId) return;

    let cleanValue = (field === 'birth' || field === 'death') ? parseInt(value) : value;

    State.deceased[field] = cleanValue;
    var payload = { id: currentId };
    payload[field] = cleanValue;

    m.request({
        method: "PUT",
        url: `${API_URL}/rdb/${DB}/perfil/${currentId}`,
        body: payload
    })
        .then(function (res) {
            showToast("💾 Guardado");
        })
        .catch(function (err) {
            console.error("Error al guardar:", err);
            showToast("❌ Error al guardar");
        });
}

function showToast(text) {
    var id = Date.now();
    State.toasts.push({ id: id, text: text });
    m.redraw();
    setTimeout(function () {
        State.toasts = State.toasts.filter(function (t) { return t.id !== id; });
        m.redraw();
    }, 3000);
}

function showConfirm(title, message, callback) {
    State.dialog = { show: true, title: title, message: message, onConfirm: callback, isPrompt: false };
}

function showPrompt(title, currentVal, callback) {
    State.dialog = { show: true, title: title, message: "", promptValue: currentVal, onConfirm: callback, isPrompt: true };
}

function deletePhoto(id) {
    showConfirm("¿Eliminar recuerdo?", "Esta acción no se puede deshacer.", function () {
        m.request({
            method: "DELETE",
            url: `${API_URL}/rdb/${DB}/fotos/${id}`
        }).then(function (res) {
            showToast("Recuerdo eliminado");
            fetchData();
        }).catch(function (err) {
            showToast("Error al eliminar");
        });
    });
}

function deleteMessage(msgObj) {
    showConfirm("¿Eliminar testimonio?", "Esta acción ocultará permanentemente este mensaje.", function () {
        m.request({
            method: "DELETE",
            url: `${API_URL}/rdb/${DB}/testimonios/${msgObj.id}`
        }).then(function (res) {
            showToast("Testimonio eliminado");
            fetchData();
        }).catch(function (err) {
            showToast("Error al eliminar");
        });
    });
}

// Límite de 4MB
const MAX_FILE_SIZE = 4 * 1024 * 1024;

// Función auxiliar para validar que sea una imagen
function isImage(file) {
    return file && file.type.startsWith('image/');
}

function handleFileUpload(e) {
    var currentId = State.deceased.id;
    var file = e.target.files[0];

    if (!file) return;

    // VALIDACIÓN: Solo imágenes
    if (!isImage(file)) {
        alert("Formato de archivo no válido. Suba un archivo de imagen");
        e.target.value = "";
        return;
    }

    // VALIDACIÓN: Tamaño
    if (file.size > MAX_FILE_SIZE) {
        alert("La imagen es demasiado grande. El límite es de 4 MB.");
        e.target.value = "";
        return;
    }

    var autor = prompt("¿Quién comparte este recuerdo?", "Anónimo");

    if (file && currentId) {
        var reader = new FileReader();
        reader.onload = function (event) {
            m.request({
                method: "POST",
                url: `${API_URL}/rdb/${DB}/fotos`,
                body: {
                    src: event.target.result,
                    uploader_name: autor || "Anónimo",
                    perfil_id: currentId
                }
            })
                .then(function (res) {
                    if (res && res.ok) {
                        showToast("📸 Foto guardada");
                        fetchData();
                    }
                });
        };
        reader.readAsDataURL(file);
    }
}

function handleProfilePicUpload(e) {
    var file = e.target.files[0];
    if (!file) return;

    // VALIDACIÓN: Solo imágenes
    if (!isImage(file)) {
        alert("Formato de archivo no válido. Suba un archivo de imagen");
        e.target.value = "";
        return;
    }

    // VALIDACIÓN: Tamaño
    if (file.size > MAX_FILE_SIZE) {
        alert("La imagen de perfil es demasiado grande (máximo 4 MB).");
        e.target.value = "";
        return;
    }

    var reader = new FileReader();
    reader.onload = function (event) {
        updateProfile('photo', event.target.result);
    };
    reader.readAsDataURL(file);
}

const Actions = {
    verifyCode: function (code) {
        return m.request({
            method: "GET",
            url: `${API_URL}/rdb/${DB}/perfil?codigo=${code}`
        }).then(result => {
            if (result && result.items && result.items.length > 0) {
                State.deceased = result.items[0];
                State.access.code = code;
                State.access.granted = true;
                State.access.isAdmin = false; // Si es un perfil, NO es admin
                State.access.error = "";

                localStorage.setItem("memorial_access_code", code);

                this.loadContent(State.deceased.id);
                m.redraw();
            } else {
                State.access.error = "Código no válido";
                State.access.granted = false;
                m.redraw();
            }
        }).catch(err => {
            State.access.error = "Error de conexión";
            m.redraw();
        });
    },

    // NUEVA FUNCIÓN: Verificación para Administrador
    verifyAdmin: function (code, password) {
        // AQUÍ DEFINES LA CONTRASEÑA SECUNDARIA
        const ADMIN_PASSWORD = "1234"; 

        if (code.toLowerCase() === "admin2026" && password === ADMIN_PASSWORD) {
            State.access.isAdmin = true;
            State.access.granted = true;
            State.access.code = code;
            State.access.error = "";
            m.redraw();
        } else {
            State.access.error = "Contraseña de administrador incorrecta";
            m.redraw();
        }
    },

    logout: function () {
        localStorage.removeItem("memorial_access_code");
        State.access.granted = false;
        State.access.code = "";
        State.access.isAdmin = false; // Resetear el permiso de admin
        State.deceased = { id: null, name: "", gallery: [], messages: [] };
        window.history.replaceState({}, document.title, window.location.pathname);
        m.redraw();
    },

    loadContent: function (perfilId) {
        if (!perfilId) return;

        m.request({
            method: "GET",
            url: `${API_URL}/rdb/${DB}/fotos?perfil_id=${perfilId}`
        }).then(r => {
            State.deceased.gallery = r.items || [];
            m.redraw();
        });

        m.request({
            method: "GET",
            url: `${API_URL}/rdb/${DB}/testimonios?perfil_id=${perfilId}`
        }).then(r => {
            State.deceased.messages = r.items || [];
            m.redraw();
        });
    }
};

// --- NUEVA FUNCIÓN PARA EL ADMIN ---
const AdminActions = {
    createProfile: function (data) {
        if (!data.codigo || data.codigo.trim() === "") {
            data.codigo = Math.random().toString(36).substring(2, 7).toUpperCase();
        }

        if (!data.photo) {
            data.photo = defaultPhoto;
        }

        return m.request({
            method: "POST",
            url: `${API_URL}/rdb/${DB}/perfil`,
            body: data
        }).then(res => {
            showToast("✅ Registro completado");
            return { ok: true, data: data };
        }).catch(err => {
            console.error("Error en el servidor:", err);
            showToast("❌ Error al guardar en la base de datos");
            throw err;
        });
    }
};

const OriginalVerifyCode = Actions.verifyCode;
Actions.verifyCode = function (code) {
    // Usamos minúsculas para evitar fallos por teclado móvil
    if (code.toLowerCase() === "admin2026") {
        State.access.isAdmin = true;
        State.access.granted = true;
        State.access.code = code;
        m.redraw();
        return Promise.resolve();
    }
    return OriginalVerifyCode.call(this, code);
};