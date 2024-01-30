// Api urls

const moviesapi =
    "https://api.toontamilind.in/anime/gogoanime/movies?page=";

// Usefull functions

async function getJson(url) {
    try {
        const response = await axios.get(url);
        return response.data;
    } catch (errors) {
        console.error(errors);
    }
}

function genresToString(genres) {
    return genres.join(", ");
}

function shuffle(array) {
    let currentIndex = array.length,
        randomIndex;

    // While there remain elements to shuffle.
    while (currentIndex > 0) {
        // Pick a remaining element.
        randomIndex = Math.floor(Math.random() * currentIndex);
        currentIndex--;

        // And swap it with the current element.
        [array[currentIndex], array[randomIndex]] = [
            array[randomIndex],
            array[currentIndex],
        ];
    }

    return array;
}


async function getMovies(page = 1) {
    const data = (await getJson(moviesapi + page))["results"];
    let RECENT_HTML = "";

    for (let pos = 0; pos < data.length; pos++) {
        let anime = data[pos];
        let title = anime["title"];
        let id = anime["id"];
        let url = "../anime.html?anime=" + id;
        let image = anime["image"];
        let ep = anime["episodeNumber"];

        RECENT_HTML += `<a href="${url}"><div class="poster la-anime"> <div id="shadow1" class="shadow"><div class="dubb">SUB</div><div class="dubb dubb2">Movie</div> </div><div id="shadow2" class="shadow"> <img class="lzy_img" src="../logo/loading.gif" data-src="${image}"> </div><div class="la-details"> <h3>${title}</h3></div></div></a>`;
    }

    document.querySelector(".mov").innerHTML += RECENT_HTML;
}

// Slider functions
let slideIndex = 0;
let clickes = 0;

function showSlides(n) {
    let i;
    let slides = document.getElementsByClassName("mySlides");
    if (n > slides.length) {
        slideIndex = 1;
    }
    if (n < 1) {
        slideIndex = slides.length;
    }
    for (i = 0; i < slides.length; i++) {
        slides[i].style.display = "none";
    }
    slides[slideIndex - 1].style.display = "flex";
}

async function showSlides2() {
    if (clickes == 1) {
        await sleep(10000);
        clickes = 0;
    }
    let i;
    let slides = document.getElementsByClassName("mySlides");
    for (i = 0; i < slides.length; i++) {
        slides[i].style.display = "none";
    }
    slideIndex++;
    if (slideIndex > slides.length) {
        slideIndex = 1;
    }
    slides[slideIndex - 1].style.display = "flex";
    setTimeout(showSlides2, 5000);
}

function plusSlides(n) {
    showSlides((slideIndex += n));
    clickes = 1;
}
function currentSlide(n) {
    showSlides((slideIndex = n));
    clickes = 1;
}

async function RefreshLazyLoader() {
    const imageObserver = new IntersectionObserver((entries, imgObserver) => {
        entries.forEach((entry) => {
            if (entry.isIntersecting) {
                const lazyImage = entry.target;
                lazyImage.src = lazyImage.dataset.src;
            }
        });
    });
    const arr = document.querySelectorAll("img.lzy_img");
    arr.forEach((v) => {
        imageObserver.observe(v);
    });
}

function sleep(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms));
}

// To load more animes when scrolled to bottom
let page = 2;
let isLoading = 0;
let errCount = 0;
function loadAnimes() {
    try {
        if (isLoading == 0) {
            isLoading = 1;
            getMovies(page).then((data) => {
                RefreshLazyLoader();
                console.log("anime movies loaded");
            });
            page += 1;
            isLoading = 0;
            errCount = 0;
        }
    } catch (error) {
        isLoading = 0;
        errCount += 1;
        if (errCount < 5) {
            setTimeout(loadAnimes(), 2000);
        }
    }
}

window.addEventListener("scroll", () => {
    if (
        window.scrollY + window.innerHeight >=
        document.documentElement.scrollHeight
    ) {
        loadAnimes();
    }
});

// Running functions

getMovies().then((data) => {
    RefreshLazyLoader();
    console.log("anime movies loaded");
});
