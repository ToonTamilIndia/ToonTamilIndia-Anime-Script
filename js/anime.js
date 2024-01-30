const infoapi = "https://api.toontamilind.in/anime/gogoanime/info/";
const epapi = "https://api.anime-dex.workers.dev/episode/";
const searchapi = "https://api.toontamilind.in/meta/anilist/";
const anilistinfoapi = "https://api.toontamilind.in/meta/anilist/info/";
const gogosearchapi = "https://api.toontamilind.in/anime/gogoanime/";

async function getJson(url) {
    try {
        let response = await axios.get(url);
        return response.data;
    } catch (error) {
        console.error(error);
    }
}

function getGenreHtml(genres) {
    return genres.map(genre => `<a>${genre}</a>`).join('');
}

async function RefreshLazyLoader() {
    let observer = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                let target = entry.target;
                target.src = target.dataset.src;
            }
        });
    });

    let lazyImages = document.querySelectorAll("img.lzy_img");
    lazyImages.forEach(image => {
        observer.observe(image);
    });
}

function getAnilistTitle(anime) {
    return anime.userPreferred || anime.english || anime.romaji || anime.native || "Unknown";
}

function getAnilistOtherTitle(anime, title) {
    return (
        anime.userPreferred !== title &&
        anime.english !== title &&
        anime.romaji !== title &&
        anime.native !== title
    )
        ? anime.userPreferred || anime.english || anime.romaji || anime.native || "Unknown"
        : "Unknown";
}

async function getAnimeInfo(animeId) {
    try {
        let animeData = await getJson(infoapi + animeId);
        updateDocumentWithAnimeData(animeData);
        document.getElementById("main-content").style.display = "block";
        document.getElementById("load").style.display = "none";

        let title = animeData.title;
        await Promise.all([getEpList(animeId), getRecommendations(title)]);
        RefreshLazyLoader();
    } catch (error) {
        await getSearchGogoAnimeInfo(animeId);
    }
}

async function getSearchGogoAnimeInfo(animeId) {
    try {
        let searchResult = await getJson(gogosearchapi + animeId);
        let gogoAnimeId = searchResult.results[0].id;
        let animeData = await getJson(infoapi + gogoAnimeId);

        updateDocumentWithAnimeData(animeData);
        document.getElementById("main-content").style.display = "block";
        document.getElementById("load").style.display = "none";

        await Promise.all([getEpList(gogoAnimeId), getRecommendations(animeId)]);
        RefreshLazyLoader();
    } catch (error) {
        await getAnilistAnimeInfo(animeId);
    }
}

async function getAnilistAnimeInfo(animeId) {
    try {
        let searchResult = await getJson(searchapi + animeId);
        let anilistId = searchResult.results[0].id;
        let animeData = await getJson(anilistinfoapi + anilistId);

        let title = getAnilistTitle(animeData.title);
        updateDocumentWithAnimeData(animeData, title);

        document.getElementById("main-content").style.display = "block";
        document.getElementById("load").style.display = "none";

        let recommendations = animeData.recommendations;
        updateLatest2(recommendations);
        document.getElementById("ephtmldiv").innerHTML = '<a class="ep-btn">Anime Name Not Found On GogoAnime, Try Searching With A Different Name...</a>';
    } catch (error) {
        console.log(error);
    }
}

async function getEpList(animeId) {
    try {
        let episodesData = await getJson("https://api.techzbots1.workers.dev/gogo/episodes/" + animeId);
        let totalEpisodes = Number(episodesData.total);
        let episodeButtons = "";

        for (let episodeNumber = 0; episodeNumber < totalEpisodes; episodeNumber++) {
            episodeButtons += `<a class="ep-btn" href="./episode.html?anime=${animeId}&episode=${episodeNumber + 1}">${episodeNumber + 1}</a>`;
        }

        document.getElementById("ephtmldiv").innerHTML = episodeButtons;
    } catch (error) {
        console.error(error);
    }
}


async function getRecommendations(animeTitle) {
    try {
        let searchResult = await getJson(searchapi + animeTitle);
        let anilistId = searchResult.results[0].id;
        let animeData = await getJson(anilistinfoapi + anilistId);

        let recommendations = animeData.recommendations;
        updateLatest2(recommendations);
    } catch (error) {
        console.log(error);
    }
}

function updateDocumentWithAnimeData(animeData, title = null) {
    document.documentElement.innerHTML = document.documentElement.innerHTML
        .replaceAll("TITLE", title || animeData.title)
        .replaceAll("IMG", animeData.image)
        .replaceAll("LANG", animeData.subOrDub.toUpperCase())
        .replaceAll("TYPE", animeData.type)
        .replaceAll("URL", window.location)
        .replaceAll("SYNOPSIS", animeData.description)
        .replaceAll("OTHER", getAnilistOtherTitle(animeData.title, title))
        .replaceAll("TOTAL", animeData.totalEpisodes)
        .replaceAll("YEAR", animeData.releaseDate)
        .replaceAll("STATUS", animeData.status)
        .replaceAll("GENERES", getGenreHtml(animeData.genres));
}

function updateLatest2(recommendations) {
    let latest2HTML = recommendations.map(recommendation => {
        let title = recommendation.title.userPreferred;
        return `
      <a href="./anime.html?anime=${title}">
        <div class="poster la-anime">
          <div id="shadow1" class="shadow">
            <div class="dubb">${recommendation.rating}</div>
            <div class="dubb dubb2">${recommendation.type}</div>
          </div>
          <div id="shadow2" class="shadow">
            <img class="lzy_img" src="./logo/loading2.gif" data-src="${recommendation.image}">
          </div>
          <div class="la-details">
            <h3>${title}</h3>
            <div id="extra">
              <span>${recommendation.status}</span>
              <span class="dot"></span>
              <span>${recommendation.episodes}</span>
            </div>
          </div>
        </div>
      </a>`;
    }).join('');

    document.getElementById("latest2").innerHTML = latest2HTML;
}

const queryString = window.location.search;
const urlParams = new URLSearchParams(queryString);

if (urlParams.get("anime") === null) {
    window.location = "./index.html";
} else {
    getAnimeInfo(urlParams.get("anime")).then(() => {
        RefreshLazyLoader();
        console.log("Anime Info loaded");
    });
}
