function App() {
    return {
        view: function () {
            return m("div", [
                m("nav.header",
                    m("h2.nav-title", "GARDEN OF REMEMBRANCE")
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