function MemorialCard() {
    return {
        view: function () {
            var p = State.deceased;
            return m("div.container", [
                m(".memorial-card.memorial-card-clean", [

                    // 1. PORTADA
                    m(".cover-photo.cover-photo-custom"),

                    // 2. GRID PRINCIPAL
                    m(".profile-grid", [

                        // --- COLUMNA IZQUIERDA ---
                        m(".profile-sidebar", [
                            m(".profile-pic-container", [
                                m("img.profile-pic.profile-pic-main", { src: p.photo }),
                                State.isAdmin ? m("label.btn-edit-photo", [
                                    m("input[type=file][accept=image/*]", {
                                        style: "display: none;", // El único inline necesario para ocultar el input real
                                        onchange: handleProfilePicUpload
                                    }),
                                    "📷"
                                ]) : null
                            ]),

                            m(".profile-sidebar-inner", [
                                m(".name-row", [
                                    m("h1.name.name-text", p.name),
                                    State.isAdmin ? m("button.btn-circle.btn-edit-small", {
                                        onclick: function () { showPrompt("Editar Nombre", p.name, function (val) { updateProfile('name', val); }); }
                                    }, "✏️") : null
                                ]),

                                m(".dates-row", [
                                    m("span", p.birth + " | " + p.death),
                                    State.isAdmin ? m("button.btn-circle.btn-edit-mini", {
                                        onclick: function () {
                                            showPrompt("Fechas (Nacimiento | Partida)", p.birth, function (val) {
                                                updateProfile('birth', val);
                                                setTimeout(function () {
                                                    var nuevaMuerte = prompt("Fecha de Partida:", p.death);
                                                    if (nuevaMuerte) updateProfile('death', nuevaMuerte);
                                                }, 500);
                                            });
                                        }
                                    }, "✏️") : null
                                ]),

                                m(".interaction-bar.interaction-bar-clean", [
                                    m(".interaction-inner", [
                                        m("button.btn-circle", { onclick: function () { State.velas++; showToast("🕯️ Homenaje enviado"); } }, "🕯️"),
                                        m("button.btn-circle", {
                                            onclick: function () {
                                                navigator.clipboard.writeText(window.location.href).then(function () { showToast("🔗 Enlace copiado"); });
                                            }
                                        }, "🔗"),
                                        m("button.btn-circle", { onclick: function () { window.print(); } }, "📄"),
                                        State.isAdmin ? m("button.btn-circle.btn-bio-edit", {
                                            onclick: function () { showPrompt("Editar biografía", p.bio, function (nb) { updateProfile('bio', nb); }); }
                                        }, "✏️ Bio") : null
                                    ])
                                ]),

                                m(".bio-container", [
                                    m("span.quote-mark.quote-left", "“"),
                                    m("p.bio-text", p.bio),
                                    m("span.quote-mark.quote-right", "”")
                                ])
                            ])
                        ]),

                        // --- COLUMNA DERECHA ---
                        m(".main-content", [
                            m("h3.section-title", [m("span", { style: "background: #fff; padding: 20px;" }, "Recuerdos")]),
                            m(".gallery.gallery-clean", [
                                p.gallery.map(function (imgData) {
                                    return m(".gallery-item", [
                                        m("img", { src: imgData.src, onclick: function () { State.modalImage = imgData.src; } }),
                                        m(".uploader-tag", "Subida por: " + (imgData.uploader_name || "Anónimo")),
                                        State.isAdmin ? m("button.btn-delete", { onclick: function () { deletePhoto(imgData.id); } }, "×") : null
                                    ]);
                                }),

                                m("label.gallery-item.gallery-add-card", [
                                    m("input[type=file][accept=image/*]", { style: "display: none;", onchange: handleFileUpload }),
                                    m("span.add-icon", "+"),
                                    m("span.add-text", "AÑADIR FOTO")
                                ]),
                            ]),

                            m("h3.section-title", [m("span", { style: "background: #fff; padding: 0 20px;" }, "Testimonios")]),
                            m(".dedication-grid.dedication-grid-clean", p.messages.map(function (msg) {
                                return m(".dedication-card.dedication-card-clean", [
                                    State.isAdmin ? m("button.btn-msg-delete", { onclick: function () { deleteMessage(msg); } }, "🗑️") : null,
                                    m("p.message", msg.text),
                                    m("span.author", "— " + msg.author)
                                ]);
                            })),

                            m("form.form-card.form-card-clean", {
                                onsubmit: function (e) {
                                    e.preventDefault();
                                    if (State.newAuthor && State.newMessage) {
                                        let txt = State.newMessage.trim();
                                        if (txt) {
                                            txt = txt.charAt(0).toUpperCase() + txt.slice(1);
                                            txt = txt.replace(/\.\s*([a-zñáéíóú])/gi, (m, l) => ". " + l.toUpperCase());
                                            if (!/[.!?]$/.test(txt)) txt += ".";
                                        }
                                        m.request({
                                            method: "POST",
                                            url: `${API_URL}/rdb/${DB}/testimonios`,
                                            body: { author: State.newAuthor, text: txt }
                                        }).then(function (res) {
                                            if (res && res.ok) { showToast("✨ Mensaje publicado"); State.newAuthor = ""; State.newMessage = ""; fetchData(); }
                                        });
                                    }
                                }
                            }, [
                                m("h4.form-title", "Dejar una dedicatoria"),
                                m(".form-body", [
                                    m("input.input-clean", {
                                        placeholder: "Su nombre o relación",
                                        value: State.newAuthor,
                                        oninput: function (e) { State.newAuthor = e.target.value; }
                                    }),
                                    m("textarea.textarea-clean", {
                                        placeholder: "Escriba su mensaje aquí...",
                                        value: State.newMessage,
                                        oninput: function (e) { State.newMessage = e.target.value; }
                                    }),
                                    m("button.btn-action", "Publicar Testimonio")
                                ])
                            ])
                        ])
                    ])
                ])
            ]);
        }
    };
}