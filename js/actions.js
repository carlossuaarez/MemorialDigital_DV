function fetchData() {
    // 1. CARGAR PERFIL (ID 1)
    m.request({
        method: "GET",
        url: `${API_URL}/rdb/${DB}/perfil`
    })
        .then(function (res) {
            if (res && res.items && res.items.length > 0) {
                var dbData = res.items.find(function (i) { return i.id == 1; }) || res.items[0];

                State.deceased.name = dbData.name || "";
                State.deceased.birth = dbData.birth || "";
                State.deceased.death = dbData.death || "";
                State.deceased.bio = dbData.bio || "";
                State.deceased.photo = dbData.photo || State.deceased.photo;
                m.redraw();
            }
        }).catch(function (e) { console.error("Error Perfil:", e); });

    // 2. CARGAR GALERÍA
    m.request({
        method: "GET",
        url: `${API_URL}/rdb/${DB}/fotos`
    })
        .then(function (res) {
            State.deceased.gallery = (res && res.items) ? res.items : [];
            m.redraw();
        }).catch(function (e) { console.error("Error Fotos:", e); });

    // 3. CARGAR TESTIMONIOS
    m.request({
        method: "GET",
        url: `${API_URL}/rdb/${DB}/testimonios`
    })
        .then(function (res) {
            State.deceased.messages = (res && res.items) ? res.items : [];
            m.redraw();
        }).catch(function (e) { console.error("Error Testimonios:", e); });
}

fetchData();

function updateProfile(field, value) {
    State.deceased[field] = value;
    var payload = { id: 1 };
    payload[field] = value;

    m.request({
        method: "PUT",
        url: `${API_URL}/rdb/${DB}/perfil/1`,
        body: payload
    })
        .then(function (res) {
            showToast("💾 Guardado");
        })
        .catch(function (err) {
            m.request({
                method: "PUT",
                url: `${API_URL}/rdb/${DB}/perfil`,
                body: payload
            }).then(function () {
                showToast("💾 Guardado");
            }).catch(function (err2) {
                console.error("Fallo crítico al guardar:", err2);
                showToast("❌ Error al guardar");
            });
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

function handleFileUpload(e) {
    var file = e.target.files[0];
    var autor = prompt("¿Quién comparte este recuerdo?", "Anónimo");

    if (file) {
        var reader = new FileReader();
        reader.onload = function (event) {
            m.request({
                method: "POST",
                url: `${API_URL}/rdb/${DB}/fotos`,
                body: {
                    src: event.target.result,
                    uploader_name: autor || "Anónimo"
                }
            })
                .then(function (res) {
                    if (res && res.ok) {
                        showToast("📸 Foto guardada");
                        fetchData();
                    } else {
                        console.error("Error server:", res);
                        showToast("❌ Error al subir");
                    }
                });
        };
        reader.readAsDataURL(file);
    }
}

function handleProfilePicUpload(e) {
    var file = e.target.files[0];
    if (file) {
        var reader = new FileReader();
        reader.onload = function (event) {
            updateProfile('photo', event.target.result);
        };
        reader.readAsDataURL(file);
    }
}