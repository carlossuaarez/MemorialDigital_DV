function LoginScreen() {
    let tempCode = "";
    let tempPass = "";
    let showPasswordField = false;

    return {
        view: function () {
            return m(".login-screen", {
                style: "display: flex; flex-direction: column; align-items: center; justify-content: center; height: 80vh;"
            }, [
                m("h1", "GARDEN OF REMEMBRANCE"),
                m("p", showPasswordField ? "Modo Administrador" : "Ingrese el código de acceso privado"),

                // Campo de Código (Solo se muestra si no estamos ya pidiendo la contraseña)
                !showPasswordField ? m("input[type=text]", {
                    style: "padding: 10px; border-radius: 8px; border: 1px solid #ccc; margin-bottom: 15px;",
                    oninput: e => tempCode = e.target.value,
                    placeholder: "Ej: TEST1 o AMIGO2",
                    value: tempCode
                }) : null,

                // Campo de Contraseña: Solo aparece tras pulsar "Entrar" con el código admin
                showPasswordField ? m("div", { style: "display: flex; flex-direction: column; align-items: center; width: 100%;" }, [
                    m("p", { style: "font-size: 0.9em; color: #666; margin-bottom: 5px;" }, "Introduzca la contraseña de seguridad:"),
                    m("input[type=password]", {
                        style: "padding: 10px; border-radius: 8px; border: 2px solid #2c3e50; margin-bottom: 15px; border-radius: 8px;",
                        oninput: e => tempPass = e.target.value,
                        placeholder: "Contraseña",
                        value: tempPass,
                        autofocus: true
                    }),
                    m("button.btn-action", {
                        style: "width: auto; padding: 5px 20px; font-size: 0.8em; margin-bottom: 10px; background: transparent; color: #666; border: none;",
                        onclick: () => { showPasswordField = false; tempPass = ""; }
                    }, "← Cambiar código")
                ]) : null,

                m("button.btn-action", {
                    style: "width: auto; padding: 10px 40px;",
                    onclick: () => {
                        const isAdminCode = tempCode.toLowerCase() === "admin2026";

                        if (isAdminCode) {
                            if (!showPasswordField) {
                                showPasswordField = true; // Primer clic: detecta admin y muestra el campo extra
                                State.access.error = ""; // Limpiar errores previos
                            } else {
                                Actions.verifyAdmin(tempCode, tempPass); // Segundo clic: ya con el campo visible, verifica la contraseña
                            }
                        } else {
                            // Flujo normal para usuarios
                            Actions.verifyCode(tempCode);
                        }
                    }
                }, showPasswordField ? "Confirmar Acceso" : "Entrar"),

                State.access.error ? m("p", { style: "color: red; margin-top: 10px;" }, State.access.error) : null
            ]);
        }
    }
}

function App() {
    return {
        oninit: function () {
            const params = new URLSearchParams(window.location.search);
            const urlCode = params.get("code");
            const savedCode = localStorage.getItem("memorial_access_code");
            const codeToUse = urlCode || savedCode;

            if (codeToUse) Actions.verifyCode(codeToUse);
        },
        view: function () {
            return m("div", [
                m("nav.header", m(".nav-container", [
                    m(".logout-container",
                        State.access.granted ? m("button.logout-button", { onclick: Actions.logout }, "Salir") : null
                    ),
                    m("h2.nav-title", "GARDEN OF REMEMBRANCE"),
                    m(".theme-toggle-wrapper", m(ThemeToggle))
                ])),

                !State.access.granted
                    ? m(LoginScreen)
                    : (State.access.isAdmin
                        ? m(AdminPanel) // Si es Admin, mostramos el panel de creación
                        : [
                            m(MemorialCard),
                            m(GalleryModal),
                            m(AdminControl),
                            m(NotificationSystem)
                        ]
                    ),

                m(Footer)
            ]);
        }
    };
}

m.mount(document.body, App);