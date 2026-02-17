function App() {
    return {
        view: function () {
            return m("div", [
                m("nav.header", 
                    m(".nav-container", [
                        m("h2.nav-title", "GARDEN OF REMEMBRANCE"),
                        m(".theme-toggle-wrapper", m(ThemeToggle))
                    ])
                ),
                m(MemorialCard),
                m(GalleryModal),
                m(AdminControl),
                m(NotificationSystem),
                m(Footer),
            ]);
        }
    };
}

m.mount(document.body, App);