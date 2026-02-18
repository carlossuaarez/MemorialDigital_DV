function LoginScreen() {
    let tempCode = "";
    return {
        view: function () {
            return m(".login-screen", {
                style: "display: flex; flex-direction: column; align-items: center; justify-content: center; height: 80vh;"
            }, [
                m("h1", "GARDEN OF REMEMBRANCE"),
                m("p", "Ingrese el código de acceso privado"),
                m("input[type=text]", {
                    style: "padding: 10px; border-radius: 8px; border: 1px solid #ccc; margin-bottom: 15px;",
                    oninput: e => tempCode = e.target.value,
                    placeholder: "Ej: TEST1",
                    value: tempCode
                }),
                m("button.btn-action", {
                    style: "width: auto; padding: 10px 40px;",
                    onclick: () => Actions.verifyCode(tempCode)
                }, "Entrar"),
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

            if (codeToUse) {
                Actions.verifyCode(codeToUse);
            }
        },
        view: function () {
            return m("div", [
                m("nav.header",
                    m(".nav-container", [
                        // CONTENEDOR IZQUIERDA
                        m(".logout-container",
                            State.access.granted ? m("button.logout-button", {
                                onclick: Actions.logout
                            }, "Salir") : null
                        ),

                        // CENTRO
                        m("h2.nav-title", "GARDEN OF REMEMBRANCE"),

                        // CONTENEDOR DERECHA
                        m(".theme-toggle-wrapper", m(ThemeToggle))
                    ])
                ),

                !State.access.granted
                    ? m(LoginScreen)
                    : [
                        m(MemorialCard),
                        m(GalleryModal),
                        m(AdminControl),
                        m(NotificationSystem)
                    ],

                m(Footer)
            ]);
        }
    };
}

m.mount(document.body, App);