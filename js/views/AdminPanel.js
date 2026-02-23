function AdminPanel() {
    let newProfile = { name: "", birth: "", death: "", bio: "", codigo: "", photo: "" };
    let lastCreatedLink = "";
    let lastProfileData = { name: "perfil", year: "" }; // Valores por defecto
    let copyStatus = "Copiar Enlace";
    const currentYear = new Date().getFullYear();

    // Función auxiliar para procesar la imagen del archivo
    const handleFileSelect = (e) => {
        const file = e.target.files[0];
        if (!file) return;

        if (file.size > 4 * 1024 * 1024) { // Límite de 4MB
            alert("La imagen es demasiado grande (máximo 4MB)");
            e.target.value = "";
            return;
        }

        const reader = new FileReader();
        reader.onload = (event) => {
            newProfile.photo = event.target.result;
            m.redraw();
        };
        reader.readAsDataURL(file);
    };

    // Función para copiar al portapapeles
    const copyToClipboard = () => {
        navigator.clipboard.writeText(lastCreatedLink).then(() => {
            copyStatus = "¡Copiado!";
            m.redraw();
            setTimeout(() => {
                copyStatus = "Copiar Enlace";
                m.redraw();
            }, 2000);
        });
    };

    // Nueva función para descargar con nombre personalizado corregida
    const downloadQR = (url) => {
        const safeName = lastProfileData.name.trim().replace(/[^a-z0-9]/gi, '_').toLowerCase();
        const fileName = `${safeName}_${lastProfileData.year}_qr.png`;

        fetch(url)
            .then(response => response.blob())
            .then(blob => {
                const link = document.createElement("a");
                link.href = URL.createObjectURL(blob);
                link.download = fileName;
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);
            });
    }; 

    return {
        view: function () {
            const qrUrl = lastCreatedLink
                ? `https://api.qrserver.com/v1/create-qr-code/?size=1000x1000&data=${encodeURIComponent(lastCreatedLink)}`
                : "";

            return m(".admin-panel", [
                m("button.logout-button", { onclick: Actions.logout }, "← Cerrar Sesión Admin"),

                m("h2", "Panel de Administración"),

                lastCreatedLink ? m(".success-box", [
                    m("h4", "¡Perfil Creado con Éxito!"),

                    m(".qr-container", [
                        m("img.qr-image", {
                            src: qrUrl,
                            alt: "Código QR"
                        })
                    ]),

                    m("p.memorial-link-label", "Enlace del memorial:"),
                    m("code.memorial-code-display", lastCreatedLink),

                    m(".action-buttons", [
                        m("button.btn-copy", {
                            onclick: copyToClipboard
                        }, copyStatus),

                        m("button.btn-download-qr", {
                            onclick: () => downloadQR(qrUrl)
                        }, "Descargar QR"),

                        m("button.btn-reset-form", {
                            onclick: () => { lastCreatedLink = ""; copyStatus = "Copiar Enlace"; }
                        }, "Crear otro perfil")
                    ])
                ]) : null,

                m(".form-card", [
                    m("h3", "Nueva Lápida Digital"),

                    m("label", "Nombre del fallecido"),
                    m("input[type=text]", {
                        oninput: e => newProfile.name = e.target.value,
                        value: newProfile.name,
                    }),

                    m(".row-dates", [
                        m(".col-date", [
                            m("label", "Nacimiento"),
                            m("input[type=number]", {
                                min: 1900,
                                max: currentYear,
                                oninput: e => newProfile.birth = e.target.value,
                                value: newProfile.birth,
                            })
                        ]),
                        m(".col-date", [
                            m("label", "Defunción"),
                            m("input[type=number]", {
                                min: 1900,
                                max: currentYear,
                                oninput: e => newProfile.death = e.target.value,
                                value: newProfile.death,
                            })
                        ])
                    ]),

                    //Campo de Biografía
                    m("label", { style: "display: block; margin-top: 15px;" }, "Biografía (Opcional)"),
                    m("textarea.bio-textarea", {
                        oninput: e => newProfile.bio = e.target.value,
                        value: newProfile.bio,
                        placeholder: "Escriba una breve historia..."
                    }),

                    //Campo de Foto de Perfil (Solo archivo)
                    m("label", { style: "display: block; margin-top: 15px;" }, "Foto de Perfil (Opcional)"),
                    m("input[type=file][accept=image/*]", {
                        onchange: handleFileSelect
                    }),
                    newProfile.photo ? m("img.profile-img-preview", {
                        src: newProfile.photo
                    }) : null,

                    m("button.btn-submit-profile", {
                        onclick: () => {
                            if (!newProfile.name) return alert("El nombre es obligatorio");

                            const birth = Number(newProfile.birth);
                            const death = Number(newProfile.death);

                            if (birth < 1900 || birth > currentYear) return alert("Año de nacimiento inválido");
                            if (death < 1900 || death > currentYear) return alert("Año de defunción inválido");
                            if (death < birth) return alert("La defunción no puede ser antes del nacimiento");

                            // PREPARAR DATOS PARA EL NOMBRE DEL ARCHIVO QR
                            lastProfileData.name = newProfile.name;
                            lastProfileData.year = death;

                            const profileToSend = {
                                ...newProfile,
                                birth: birth,
                                death: death,
                                bio: newProfile.bio || "",
                                photo: newProfile.photo || defaultPhoto
                            };

                            AdminActions.createProfile(profileToSend).then(res => {
                                const baseUrl = window.location.origin + window.location.pathname;
                                const finalCode = profileToSend.codigo || res.data.codigo;
                                lastCreatedLink = `${baseUrl}?code=${finalCode}`;

                                newProfile = { name: "", birth: "", death: "", bio: "", codigo: "", photo: "" };
                                m.redraw();
                            });
                        }
                    }, "Registrar y Obtener Enlace")
                ])
            ]);
        }
    };
}