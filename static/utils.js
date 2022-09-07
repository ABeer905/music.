//Initializing calls
const createPlaylistModal = new bootstrap.Modal(document.getElementById('addPlaylist'))
const delPlaylistModal = new bootstrap.Modal(document.getElementById('delPlaylist'))

window.playlist.getAll()

const resize = () => {
    container.style.height = `${window.innerHeight - nav.getBoundingClientRect().height}px`
}
resize()

//Event listeners
window.addEventListener("resize", () => resize())

addPlaylist.addEventListener("hidden.bs.modal", () => {
    addName.value = ""
    addImage.value = ""
})

addPlaylist.addEventListener("show.bs.modal", () => document.getElementById("missing-alert").style.visibility = "hidden")
addPlaylist.addEventListener("shown.bs.modal", () => addName.focus())

//Helper functions
const createPlaylist = () => {
    if(addName.value == "" || addImage.value == "") {
        document.getElementById("missing-field").innerText = addName.value == "" ? "name" : "image"
        document.getElementById("missing-alert").style.visibility = "visible"
        return
    }
    window.playlist.create(addName.value, addImage.files[0].path)
    createPlaylistModal.hide()
}

const editPlaylist = (name) => {
    const e = document.getElementById(`${name}-edit`)
    e.readOnly = false
    e.focus()
}

const delPlaylist = (name) => {
    document.getElementById("confirm-delete").innerText = name
    delPlaylistModal.show()
}

const confirmDelete = () => {
    delPlaylistModal.hide()
    const name = document.getElementById("confirm-delete").innerText
    const e = document.getElementById(`${name}-playlist`)
    e.remove()
    window.playlist.delete(name)
}

