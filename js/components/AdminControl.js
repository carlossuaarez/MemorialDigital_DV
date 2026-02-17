function AdminControl() {
    return {
        view: function () {
            return m(".admin-wrapper", [
                State.showAdminPanel ? m(".admin-panel-card", [
                    !State.isAdmin ? [
                        m("h5", "Acceso Familiar"),
                        m("input[type=password][placeholder=PIN]", {
                            value: State.inputPin,
                            oninput: function (e) { State.inputPin = e.target.value; }
                        }),
                        m("button.btn-action.btn-admin-login", {
                            onclick: function () {
                                if (State.inputPin === "1234") {
                                    State.isAdmin = true;
                                    State.inputPin = "";
                                    showToast("Modo editor activado");
                                } else {
                                    showToast("PIN incorrecto");
                                }
                            }
                        }, "Entrar")
                    ] : [
                        m(".admin-status-tag", "EDITOR ACTIVO"),
                        m("button.btn-action.btn-admin-logout", {
                            onclick: function () {
                                State.isAdmin = false;
                                State.showAdminPanel = false;
                                showToast("Editor cerrado");
                            }
                        }, "Cerrar Sesión")
                    ]
                ]) : null,
                m("button.btn-circle.btn-settings", {
                    onclick: function () { State.showAdminPanel = !State.showAdminPanel; }
                }, State.showAdminPanel ? "×" : "⚙️")
            ]);
        }
    }
}