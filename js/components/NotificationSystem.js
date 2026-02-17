function NotificationSystem() {
    return {
        view: function () {
            return m("div", [
                m(".toast-container", State.toasts.map(function (t) { return m(".toast", t.text); })),
                State.dialog.show ? m(".dialog-overlay", [
                    m(".dialog-box", [
                        m("h3", State.dialog.title),
                        m("p", State.dialog.message),
                        State.dialog.isPrompt ? m("textarea.dialog-textarea", {
                            rows: 4,
                            value: State.dialog.promptValue,
                            oninput: function (e) { State.dialog.promptValue = e.target.value; }
                        }) : null,
                        m(".dialog-buttons", [
                            m("button.btn-action.btn-cancel", {
                                onclick: function () { State.dialog.show = false; }
                            }, "Cancelar"),
                            m("button.btn-action", {
                                onclick: function () {
                                    if (State.dialog.isPrompt) State.dialog.onConfirm(State.dialog.promptValue);
                                    else State.dialog.onConfirm();
                                    State.dialog.show = false;
                                }
                            }, "Aceptar")
                        ])
                    ])
                ]) : null
            ]);
        }
    };
}