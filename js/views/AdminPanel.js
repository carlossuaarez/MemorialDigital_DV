function AdminPanel() {
    let newProfile = { name: "", birth: "", death: "", bio: "", codigo: "", photo: "" };
    let lastCreatedLink = "";
    let copyStatus = "Copiar Enlace"; // Para dar feedback visual al copiar
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

    return {
        view: function () {
            return m(".admin-panel", { style: "padding: 20px; max-width: 600px; margin: 0 auto; font-family: sans-serif;" }, [
                m("button.logout-button", { onclick: Actions.logout, style: "margin-bottom: 20px" }, "← Cerrar Sesión Admin"),

                m("h2", "Panel de Administración"),

                lastCreatedLink ? m(".success-box", {
                    style: "background: #d4edda; border: 1px solid #c3e6cb; padding: 20px; border-radius: 8px; margin-bottom: 20px; color: #155724;"
                }, [
                    m("h4", "¡Perfil Creado con Éxito!"),
                    m("p", "Copia este enlace para el código QR:"),
                    m("code", {
                        style: "display: block; background: white; padding: 10px; border: 1px solid #ccc; word-break: break-all; margin-bottom: 10px;"
                    }, lastCreatedLink),

                    // BOTONES DE ACCIÓN POST-CREACIÓN
                    m(".action-buttons", { style: "display: flex; gap: 10px;" }, [
                        m("button", {
                            style: "background: #28a745; color: white; border: none; padding: 8px 15px; border-radius: 5px; cursor: pointer;",
                            onclick: copyToClipboard
                        }, copyStatus),

                        m("button", {
                            style: "background: transparent; border: 1px solid #666; padding: 8px 15px; border-radius: 5px; cursor: pointer;",
                            onclick: () => { lastCreatedLink = ""; copyStatus = "Copiar Enlace"; }
                        }, "Crear otro perfil")
                    ])
                ]) : null,

                m(".form-card", { style: "background: var(--bg-card); padding: 20px; border-radius: 12px; border: 1px solid var(--border-soft);" }, [
                    m("h3", "Nueva Lápida Digital"),

                    m("label", "Nombre del fallecido"),
                    m("input[type=text]", {
                        oninput: e => newProfile.name = e.target.value,
                        value: newProfile.name,
                    }),

                    m(".row", { style: "display: flex; gap: 10px; margin-top: 15px;" }, [
                        m("div", { style: "flex: 1" }, [
                            m("label", "Nacimiento"),
                            m("input[type=number]", {
                                min: 1900,
                                max: currentYear,
                                oninput: e => newProfile.birth = e.target.value,
                                value: newProfile.birth,
                            })
                        ]),
                        m("div", { style: "flex: 1" }, [
                            m("label", "Defunción"),
                            m("input[type=number]", {
                                min: 1900,
                                max: currentYear,
                                oninput: e => newProfile.death = e.target.value,
                                value: newProfile.death,
                            })
                        ])
                    ]),

                    // NUEVO: Campo de Bio
                    m("label", { style: "display: block; margin-top: 15px;" }, "Biografía (Opcional)"),
                    m("textarea", {
                        style: "width: 100%; min-height: 80px; padding: 10px; border-radius: 8px; border: 1px solid #ccc; font-family: inherit;",
                        oninput: e => newProfile.bio = e.target.value,
                        value: newProfile.bio,
                        placeholder: "Escriba una breve historia..."
                    }),

                    // NUEVO: Campo de Foto de Perfil (Solo archivo)
                    m("label", { style: "display: block; margin-top: 15px;" }, "Foto de Perfil (Opcional)"),
                    m("input[type=file][accept=image/*]", {
                        style: "margin-bottom: 10px;",
                        onchange: handleFileSelect
                    }),
                    newProfile.photo ? m("img", {
                        src: newProfile.photo,
                        style: "display: block; width: 60px; height: 60px; object-fit: cover; border-radius: 50%; border: 2px solid #ccc;"
                    }) : null,

                    m("button.btn-action", {
                        style: "width: 100%; margin-top: 25px; background: #2c3e50; color: white; padding: 12px;",
                        onclick: () => {
                            if (!newProfile.name) return alert("El nombre es obligatorio");

                            const birth = Number(newProfile.birth);
                            const death = Number(newProfile.death);

                            if (birth < 1900 || birth > currentYear) {
                                return alert("El año de nacimiento debe estar entre 1900 y " + currentYear);
                            }
                            if (death < 1900 || death > currentYear) {
                                return alert("El año de defunción debe estar entre 1900 y " + currentYear);
                            }
                            if (death < birth) {
                                return alert("El año de defunción no puede ser menor al de nacimiento");
                            }

                            // Preparar datos finales con autocompletado
                            const profileToSend = {
                                ...newProfile,
                                birth: birth,
                                death: death,
                                bio: newProfile.bio || "", // Cadena vacía si no hay bio
                                photo: newProfile.photo || defaultPhoto // Foto predeterminada desde state.js
                            };

                            AdminActions.createProfile(profileToSend).then(res => {
                                const baseUrl = window.location.origin + window.location.pathname;
                                const finalCode = profileToSend.codigo || res.data.codigo;
                                lastCreatedLink = `${baseUrl}?code=${finalCode}`;

                                // Resetear formulario
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