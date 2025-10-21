const departMinutes = 60;
let temps = departMinutes * 60;

const chronoElement = document.getElementById("chrono");

setInterval(() => {
    let minutes = parseInt(temps / 60, 10);
    let secondes = parseInt(temps % 60, 10);

    minutes = minutes < 10 ? "0" + minutes : minutes;
    secondes = secondes < 10 ? "0" + secondes : secondes;

    chronoElement.innerText = `${minutes}:${secondes}`;
    temps = temps <= 0 ? 0 : temps - 1;
}, 1000);