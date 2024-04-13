const AniSkip = "http://127.0.0.1:5000/";
const ProxyApi = "https://proxy.toontamilindia.workers.dev/?u=";
const animeapi = "/anime/";
const episodeapi = "/episode/";
const dlapi = "/download/";

// Api Server Manager

const AvailableServers = [
    "https://api1.toontamilindia.workers.dev",
    "https://api2.toontamilindia.workers.dev",
    "https://api3.toontamilindia.workers.dev",
];

function getApiServer() {
    return AvailableServers[Math.floor(Math.random() * AvailableServers.length)];
}

// Usefull functions

async function getJson(path, errCount = 0) {
    const ApiServer = getApiServer();
    let url = ApiServer + path;

    if (errCount > 2) {
        throw `Too many errors while fetching ${url}`;
    }

    if (errCount > 0) {
        // Retry fetch using proxy
        console.log("Retrying fetch using proxy");
        url = ProxyApi + url;
    }

    try {
        const response = await fetch(url);
        return await response.json();
    } catch (errors) {
        console.error(errors);
        return getJson(path, errCount + 1);
    }
}

function sentenceCase(str) {
    if (str === null || str === "") return false;
    else str = str.toString();

    return str.replace(/\w\S*/g, function (txt) {
        return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();
    });
}

function capitalizeFirstLetter(string) {
    return string.charAt(0).toUpperCase() + string.slice(1);
}

// Function to get m3u8 url of episode with skip intervals
async function loadEpisodeData(data, skipIntervals) {
    data = data["results"];
    const name = data["name"];
    const episodes = data["episodes"];
    const stream = data["stream"];
    const servers = data["servers"];

    document.documentElement.innerHTML =
        document.documentElement.innerHTML.replaceAll("{{ title }}", name);

    try {
        if (stream == null) {
            throw "Failed To Load Ad Free Servers";
        }
        
        loadVideo(name, stream, skipIntervals).then(() => {
            console.log("Video loaded");
            loadServers(servers, true).then(() => {
                console.log("Servers loaded");
            });
        });
    } catch (err) {
        loadServers(servers, false).then(() => {
            console.log("Servers loaded");
        });
    }
}

async function loadVideo(name, stream, skipIntervals) {
    // Adjust URLs for Player 1, Player 2, and Art Player using skip intervals
    const episodeid = urlParams.get("anime") + "-episode-" + urlParams.get("episode");
    const opStart = skipIntervals.results[0].interval.startTime;
    const opStop = skipIntervals.results[0].interval.endTime;
    const edStart = skipIntervals.results[1].interval.startTime;
    const edStop = skipIntervals.results[1].interval.endTime;

    try {
        document.getElementById("ep-name").innerHTML = name;
        const serversbtn = document.getElementById("serversbtn");

        let url = stream["sources"][0]["file"];
        serversbtn.innerHTML += `<div class="sitem"> <a class="sobtn sactive" onclick="selectServer(this)" data-value="./embed.html?url=${url}&id=${episodeid}&opstart=${opStart}&opstop=${opStop}&edstart=${edStart}&edstop=${edStop}">Player 1</a> </div>`;
        document.getElementsByClassName("sactive")[0].click();

        url = stream["sources_bk"][0]["file"];
        serversbtn.innerHTML += `<div class="sitem"> <a class="sobtn" onclick="selectServer(this)" data-value="./embed.html?url=${url}&id=${episodeid}&opstart=${opStart}&opstop=${opStop}&edstart=${edStart}&edstop=${edStop}">Player 2</a> </div>`;

        url = stream["sources"][0]["file"];
        serversbtn.innerHTML += `<div class="sitem"> <a class="sobtn sactive" onclick="selectServer(this)" data-value="./artplayer.html?url=${url}&id=${episodeid}&opstart=${opStart}&opstop=${opStop}&edstart=${edStart}&edstop=${edStop}">Art Player</a> </div>`;
        document.getElementsByClassName("sactive")[0].click();

        return true;
    } catch (err) {
        return false;
    }
}


// Function to available servers
async function loadServers(servers, success = true) {
    const serversbtn = document.getElementById("serversbtn");

    html = "";

    for (let [key, value] of Object.entries(servers)) {
        if (key != 'vidcdn') {
            key = capitalizeFirstLetter(key);
            if (key == 'Streamwish') {
                html += `<div class="sitem"> <a class="sobtn" onclick="selectServer(this,true)" data-value="${value}">Player 3</a> </div>`;
            } else {
                html += `<div class="sitem"> <a class="sobtn" onclick="selectServer(this)" data-value="${value}">${key}</a> </div>`;
            }
        }
    }
    serversbtn.innerHTML += html;

    if (success == false) {
        document.getElementsByClassName("sobtn")[0].click();
    }
}

// Function to select server
function selectServer(btn, sandbox = false) {
    const buttons = document.getElementsByClassName("sobtn");
    const iframe = document.getElementById("AnimeFrame");

    if (sandbox == true) {
        iframe.sandbox = "allow-forms allow-pointer-lock allow-same-origin allow-scripts allow-top-navigation";
    } else {
        iframe.removeAttribute("sandbox");
    }

    iframe.src = btn.getAttribute("data-value");
    for (let i = 0; i < buttons.length; i++) {
        buttons[i].className = "sobtn";
    }
    btn.className = "sobtn sactive";
}

// Function to show download links
function showDownload() {
    document.getElementById("showdl").style.display = "none";
    document.getElementById("dldiv").classList.toggle("show");

    getDownloadLinks(urlParams.get("anime"), urlParams.get("episode")).then(
        () => {
            console.log("Download links loaded");
        }
    );
}

// Function to get episode list
let Episode_List = [];

async function getEpList(anime_id, current_ep) {
    current_ep = Number(current_ep.replace('-', '.'));
    const data = (await getJson(animeapi + anime_id))["results"];

    const total = data["episodes"];
    Episode_List = total;
    const TotalEp = total.length;
    let html = "";

    for (let i = 0; i < total.length; i++) {
        const x = total[i][1].split("-episode-");
        const animeid = x[0];
        const epnum = Number(x[1].replaceAll('-', '.'));

        if (((epnum - 1) % 100) === 0) {
            let epUpperBtnText;
            if ((TotalEp - epnum) < 100) {
                epUpperBtnText = `${epnum} - ${TotalEp}`;

                if ((epnum <= current_ep) && (current_ep <= TotalEp)) {
                    html += `<option id="default-ep-option" class="ep-btn" data-from=${epnum} data-to=${TotalEp}>${epUpperBtnText}</option>`;
                    getEpLowerList(epnum, TotalEp);
                } else {
                    html += `<option class="ep-btn" data-from=${epnum} data-to=${TotalEp}>${epUpperBtnText}</option>`;
                }
            } else {
                epUpperBtnText = `${epnum} - ${epnum + 99}`;

                if ((epnum <= current_ep) && (current_ep <= (epnum + 99))) {
                    html += `<option id="default-ep-option" class="ep-btn" data-from=${epnum} data-to=${(epnum + 99)}>${epUpperBtnText}</option>`;
                    getEpLowerList(epnum, (epnum + 99));
                } else {
                    html += `<option class="ep-btn" data-from=${epnum} data-to=${(epnum + 99)}>${epUpperBtnText}</option>`;
                }
            }
        }
    }
    document.getElementById('ep-upper-div').innerHTML = html;
    document.getElementById('default-ep-option').selected = true;
    console.log("Episode list loaded");
    return total;
}

async function getEpLowerList(start, end) {
    const animeid = urlParams.get("anime")
    const current_ep = Number(urlParams.get("episode").replace('-', '.'));

    let html = "";
    const eplist = Episode_List.slice(start - 1, end);

    for (let i = 0; i < eplist.length; i++) {
        const x = eplist[i][1].split("-episode-");
        const animeid = x[0];
        let epnum = Number(x[1].replaceAll('-', '.'));

        let epLowerBtnText;
        epLowerBtnText = `${epnum}`;

        if (epnum === current_ep) {
            epnum = String(epnum).replaceAll('.', '-');
            html += `<a class="ep-btn-playing ep-btn" href="./episode.html?anime=${animeid}&episode=${epnum}">${epLowerBtnText}</a>`;
        } else {
            html += `<a class="ep-btn" href="./episode.html?anime=${animeid}&episode=${epnum}">${epLowerBtnText}</a>`;
        }
    }
    document.getElementById('ep-lower-div').innerHTML = html;
}

async function episodeSelectChange(elem) {
    const option = elem.options[elem.selectedIndex];
    getEpLowerList(parseInt(option.getAttribute('data-from')), parseInt(option.getAttribute('data-to')))
}

// Function to get download links
async function getDownloadLinks(anime, episode) {
    const data = (await getJson(dlapi + anime + "-episode-" + episode))[
        "results"
    ];
    let html = "";

    for (const [key, value] of Object.entries(data)) {
        const quality = key.split("x")[1];
        const url = value;
        html += `<div class="sitem"> <a class="sobtn download" target="_blank" href="${url}"><i class="fa fa-download"></i>${quality}p</a> </div>`;
    }
    document.getElementById("dllinks").innerHTML = html;
}

function isShortNumber(n) {
    let x = Number(String(n).replace('.', ''))

    if (x < 20) {
        return true
    }
    else {
        return false
    }

}

// Function to get episode Slider
async function getEpSlider(total, current) {
    current = Number(current.replace('-', '.'));
    let ephtml = "";

    for (let i = 0; i < total.length; i++) {
        let episodeId = total[i][1]
        let epNum = total[i][0]
        let x = episodeId.split("-episode-");
        if (epNum == current) {
            if (isShortNumber(epNum)) {
                ephtml += `<div class="ep-slide ep-slider-playing"><a href="./episode.html?anime=${x[0]}&episode=${x[1]}"><img onerror="retryImageLoad(this)" class="lzy_img" src="./logo/loading.gif" data-src=http://toontamilindia.pythonanywhere.com/anime/${episodeId}><div class=ep-title><span>Episode ${epNum} - Playing</span></div></a></div>`;
            }
            else {
                ephtml += `<div class="ep-slide ep-slider-playing"><a href="./episode.html?anime=${x[0]}&episode=${x[1]}"><img onerror="retryImageLoad(this)" class="lzy_img" src="./logo/loading.gif" data-src=http://toontamilindia.pythonanywhere.com/anime/${episodeId}><div class=ep-title><span>Ep ${epNum} - Playing</span></div></a></div>`;
            }
        }
        else {
            if (isShortNumber(epNum)) {
                ephtml += `<div class=ep-slide><a href="./episode.html?anime=${x[0]}&episode=${x[1]}"><img onerror="retryImageLoad(this)" class="lzy_img" src="./logo/loading.gif" data-src=http://toontamilindia.pythonanywhere.com/anime/${episodeId}><div class=ep-title><span>Episode ${epNum}</span></div></a></div>`;
            }
            else {
                ephtml += `<div class=ep-slide><a href="./episode.html?anime=${x[0]}&episode=${x[1]}"><img onerror="retryImageLoad(this)" class="lzy_img" src="./static/loading1.gif" data-src=http://toontamilindia.pythonanywhere.com/anime/${episodeId}><div class=ep-title><span>Ep ${epNum}</span></div></a></div>`;
            }
        }
    }
    document.getElementById("ep-slider").innerHTML = ephtml;
    document.getElementById("slider-main").style.display = "block";
    RefreshLazyLoader();

    // Scroll to playing episode
    document.getElementById('main-section').style.display = "block";
    document.getElementsByClassName("ep-slider-playing")[0].scrollIntoView({ behavior: "instant", inline: "start", block: 'end' });
    document.getElementsByClassName("ep-btn-playing")[0].scrollIntoView({ behavior: "instant", inline: "start", block: 'end' });
    window.scrollTo({
        top: 0,
        left: 0,
        behavior: "instant",
    });

    setTimeout(() => {
        document.getElementById('main-section').style.opacity = 1;
        document.getElementById('load').style.display = "none";
    }, 100);

}

// Retry image load
function retryImageLoad(img) {
    const ImageUrl = img.src
    img.src = "./logo/loading.gif";

    // load after 3 second

    setTimeout(() => {

        if (ImageUrl.includes("?t=")) {
            const t = Number(ImageUrl.split("?t=")[1]) + 1;

            // Retry 10 times
            if (t < 5) {
                img.src = ImageUrl.split("?t=")[0] + "?t=" + String(t);
            }
        }
        else {
            img.src = ImageUrl + "?t=1";
        }

    }, 3000);

}

// Function to scroll episode slider
function plusSlides(n) {
    if (n === 1) {
        document.getElementById("slider-carousel").scrollLeft += 600;
    }
    else if (n === -1) {
        document.getElementById("slider-carousel").scrollLeft -= 600;
    }
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

const queryString = window.location.search;
const urlParams = new URLSearchParams(queryString);

if (urlParams.get("anime") == null || urlParams.get("episode") == null) {
    window.location = "./index.html";
}

// Running functions

async function loadEpisodeData(data) {
    data = data["results"];
    const name = data["name"];
    const episodes = data["episodes"];
    const stream = data["stream"];
    const servers = data["servers"];

    document.documentElement.innerHTML =
        document.documentElement.innerHTML.replaceAll("{{ title }}", name);

    try {
        if (stream == null) {
            throw "Failed To Load Ad Free Servers";
        }
        // Fetch skip intervals from AniSkip API
        const skipIntervals = await getJson(await getJson(AniSkip + anime + "-episode-" + episode));
            loadVideo(name, stream, skipIntervals).then(() => {
            console.log("Video loaded");
            loadServers(servers, true).then(() => {
                console.log("Servers loaded");
            });
        });
    } catch (err) {
        loadServers(servers, false).then(() => {
            console.log("Servers loaded");
        });
    }
}

async function loadData() {
    try {
        let data = await getJson(
            episodeapi +
            urlParams.get("anime") +
            "-episode-" +
            urlParams.get("episode")
        );

        await loadEpisodeData(data)
        const eplist = await getEpList(urlParams.get("anime"), urlParams.get("episode"))
        console.log("Episode list loaded");
        await getEpSlider(eplist, urlParams.get("episode"))
        console.log("Episode Slider loaded");
    } catch (err) {
        document.getElementById("main-section").style.display = "none";
        document.getElementById("error-page").style.display = "block";
        document.getElementById("error-desc").innerHTML = err;
        console.error(err);
    }
    document.getElementById('AnimeFrame').focus()
}

loadData();
