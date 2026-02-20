function AdminPanel() {
    let newProfile = { name: "", birth: "", death: "", bio: "", codigo: "" };
    let lastCreatedLink = "";
    const currentYear = new Date().getFullYear();

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
                        style: "display: block; background: white; padding: 10px; border: 1px solid #ccc; word-break: break-all;"
                    }, lastCreatedLink),
                    m("button", {
                        style: "margin-top: 10px;",
                        onclick: () => lastCreatedLink = ""
                    }, "Crear otro perfil")
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

                    m("label", { style: "display: block; margin-top: 15px;" }, "Código personalizado (opcional)"),
                    m("input[type=text]", {
                        oninput: e => newProfile.codigo = e.target.value.toUpperCase(),
                        value: newProfile.codigo,
                        placeholder: "Ej: MARIA24"
                    }),

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

                            newProfile.birth = birth;
                            newProfile.death = death;

                            AdminActions.createProfile(newProfile).then(res => {
                                const baseUrl = window.location.origin + window.location.pathname;
                                const finalCode = newProfile.codigo || res.data.codigo;
                                lastCreatedLink = `${baseUrl}?code=${finalCode}`;
                                newProfile = { name: "", birth: "", death: "", bio: "", codigo: "" };
                                m.redraw();
                            });
                        }
                    }, "Registrar y Obtener Enlace")
                ])
            ]);
        }
    };
}