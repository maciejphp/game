const start = document.getElementById("startGame");
const main = document.getElementById("main")

start.addEventListener("click", hideMenu);

function hideMenu() {
    main.classList.add("hidden");
    //background.classList.add("hidden");
}

