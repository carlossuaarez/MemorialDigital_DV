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
                document.body.appendChild(link); // Añadimos al body por compatibilidad
                link.click();
                document.body.removeChild(link);
            });
    }; 

    return {
        view: function () {
            const qrUrl = lastCreatedLink
                ? `https://api.qrserver.com/v1/create-qr-code/?size=1000x1000&data=${encodeURIComponent(lastCreatedLink)}`
                : "";

            return m(".admin-panel", { style: "padding: 20px; max-width: 600px; margin: 0 auto; font-family: sans-serif;" }, [
                m("button.logout-button", { onclick: Actions.logout, style: "margin-bottom: 20px" }, "← Cerrar Sesión Admin"),

                m("h2", "Panel de Administración"),

                lastCreatedLink ? m(".success-box", {
                    style: "background: #d4edda; border: 1px solid #c3e6cb; padding: 25px; border-radius: 12px; margin-bottom: 20px; color: #155724; text-align: center;"
                }, [
                    m("h4", { style: "margin-top: 0" }, "¡Perfil Creado con Éxito!"),

                    m("div", { style: "background: white; padding: 15px; display: inline-block; border-radius: 10px; box-shadow: 0 4px 10px rgba(0,0,0,0.1); margin-bottom: 15px;" }, [
                        m("img", {
                            src: qrUrl,
                            alt: "Código QR",
                            style: "width: 180px; height: 180px; display: block;"
                        })
                    ]),

                    m("p", { style: "font-size: 0.9rem; margin-bottom: 10px;" }, "Enlace del memorial:"),
                    m("code", {
                        style: "display: block; background: white; padding: 10px; border: 1px solid #ccc; word-break: break-all; margin-bottom: 15px; font-size: 0.8rem;"
                    }, lastCreatedLink),

                    m(".action-buttons", { style: "display: flex; gap: 10px; justify-content: center; flex-wrap: wrap;" }, [
                        m("button", {
                            style: "background: #28a745; color: white; border: none; padding: 10px 20px; border-radius: 8px; cursor: pointer; font-weight: 600;",
                            onclick: copyToClipboard
                        }, copyStatus),

                        m("button", {
                            style: "background: #3498db; color: white; border: none; padding: 10px 20px; border-radius: 8px; cursor: pointer; font-weight: 600; font-size: 13.3px;",
                            onclick: () => downloadQR(qrUrl)
                        }, "Descargar QR"),

                        m("button", {
                            style: "background: transparent; border: 1px solid #666; padding: 10px 20px; border-radius: 8px; cursor: pointer;",
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