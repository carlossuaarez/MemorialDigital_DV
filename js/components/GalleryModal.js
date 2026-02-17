function GalleryModal() {
    return {
        view: function () {
            return m(".gallery-modal", {
                class: State.modalImage ? "is-active" : "",
                onclick: function () { State.modalImage = null; }
            }, [
                m("img.modal-img", {
                    src: State.modalImage
                })
            ]);
        }
    };
}