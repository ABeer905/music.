const resize = () => {
    container.style.height = `${window.innerHeight - nav.getBoundingClientRect().height}px`
}
resize()
window.addEventListener("resize", () => resize())

