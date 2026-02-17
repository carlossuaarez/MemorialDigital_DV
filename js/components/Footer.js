function Footer() {
    return {
        view: function () {
            return m("footer.main-footer", [
                m(".footer-grid", [
                    // Columna 1: Branding
                    m(".footer-column", [
                        m(".footer-branding", [
                            m(".footer-logo-square", "G"),
                            m("span.footer-brand-name", "GARDEN OF REMEMBRANCE")
                        ]),
                        m("p", "Lorem ipsum dolor sit amet consectetur adipisicing elit. Doloribus at obcaecati porro modi adipisci quod officia, similique necessitatibus inv")
                    ]),

                    // Columna 2: Enlaces
                    m(".footer-column", [
                        m("h4", "Navegación"),
                        m("ul.footer-links", [
                            m("li", "Centro de Ayuda"),
                            m("li", "Lorem ipsum"),
                            m("li", "Lorem")
                        ])
                    ]),

                    // Columna 3: Social
                    m(".footer-column", [
                        m("h4", "Redes Sociales"),
                        m(".social-icons", [
                            m("a.social-icon", { href: "#" }, "Instagram"),
                            m("a.social-icon", { href: "#" }, "Twitter"),
                            m("a.social-icon", { href: "#" }, "Facebook")
                        ])
                    ])
                ]),

                // Copyright Bar
                m(".copyright-bar", [
                    m("span", "© 2026 Garden Of Remembrance"),
                    m(".footer-legal-links", [
                        m("span", "Privacidad"),
                        m("span", "Términos")
                    ])
                ])
            ])
        }
    }
}