document.addEventListener("readystatechange", (event) => {
    if (event.target.readyState == "complete") {
        // console.log("readystateworking");
        initApp();
    }
});

function initApp() {
    // console.log("init working");
    setSearchFocus();
    // 3 listeners
    const input = document.getElementById("searchBar");
    input.addEventListener("input", showClearTextButton);
    search();
    const clear = document.getElementById("crosspng");
    clear.addEventListener("click", clearSearchText);
    clear.addEventListener("keydown", clearPushListener);
    extras();
}

function search() {
    const form = document.getElementById("searchForm");
    form.addEventListener("submit", (event) => {
        event.preventDefault();
        // console.log("working");
        deleteSearchResults();
        pocessTheSearch();
    });
}

function showClearTextButton() {
    const search = document.getElementById("searchBar");
    const clear = document.getElementById("crosspng");
    const voice = document.getElementById("vpng");
    if (search.value.length) {
        clear.style.display = "initial";
        voice.style.display = "none";
    } else {
        clear.style.display = "none";
        voice.style.display = "initial";
    }
}

function deleteSearchResults() {
    const parentElement = document.getElementById("searchResults");
    let child = parentElement.lastElementChild;
    while (child) {
        parentElement.removeChild(child);
        child = parentElement.lastElementChild;
    };
}

function clearSearchText(event) {
    event.preventDefault();
    document.getElementById("searchBar").value = "";
    const clear = document.getElementById("crosspng");
    clear.style.display = "none";
    const voice = document.getElementById("vpng");
    voice.style.display = "initial";
    setSearchFocus();
}

function clearPushListener(event) {
    if (event.key === "Enter" || event.key === ' ') {
        event.preventDefault();
        document.getElementById("crosspng").click();
    };
}

async function pocessTheSearch() {
    clearStatsLine();
    const finalTerm = getSearchTerm();
    // console.log(finalTerm);
    const resultArray = await retrieveSearchResults(finalTerm);
    console.log(resultArray);
    if (resultArray.length) buildSearchResults(resultArray);
    setStatsLine(resultArray.length);
}

function getSearchTerm() {
    const rawSearchTerm = document.getElementById("searchBar").value.trim();
    if (rawSearchTerm != "") {
        const regex = /[ ]{2,}/gi;
        return rawSearchTerm.replace(regex, " ");
    }
}

async function retrieveSearchResults(finalTerm) {
    const wikiSearchString = getWikiSearchString(finalTerm);
    const wikiSearchResults = await requestData(wikiSearchString);
    let resultArray = [];
    if (wikiSearchResults.hasOwnProperty("query")) {
        resultArray = processSearchResults(wikiSearchResults.query.pages);
    };
    return resultArray;
}

function getWikiSearchString(finalTerm) {
    const maxChars = getMaxChars();
    console.log(finalTerm);
    const rawSearchString = `https://en.wikipedia.org/w/api.php?action=query&generator=search&gsrsearch=${finalTerm}&gsrlimit=20&prop=pageimages|extracts&exchars=${maxChars}&exintro&explaintext&exlimit=max&format=json&origin=*`;
    const searchString = encodeURI(rawSearchString);
    console.log(searchString);
    return searchString;
}

function getMaxChars() {
    const width = window.innerWidth || document.body.clientWidth;
    let maxChars;
    if (width < 414) maxChars = 65;
    if (width >= 414 && width < 1400) maxChars = 100;
    if (width >= 1400) maxChars = 130;
    return maxChars;
}

async function requestData(searchString) {
    try {
        const response = await fetch(searchString);
        const data = await response.json();
        return data;
    } catch (err) {
        console.error(err);
    }
}

function processSearchResults(results) {
    const resultArray = [];
    Object.keys(results).forEach((key) => {
        const id = key;
        const title = results[key].title;
        const text = results[key].extract;
        const img = results[key].hasOwnProperty("thumbnail") ? results[key].thumbnail.source : null;
        const item = {
            id: id,
            title: title,
            text: text,
            img: img,
        };
        resultArray.push(item);
    });
    return resultArray;
}

function buildSearchResults(resultArray) {
    document.getElementById("searchBox").style.display = "initial";
    resultArray.forEach(result => {
        const resultItem = createResultItems(result);
        const resultContents = document.createElement("div");
        if (result.img) {
            const resultImage = createResultImage(result);
            resultContents.append(resultImage);
        };
        const resultText = createResultText(result);
        resultContents.append(resultText);
        resultItem.append(resultContents);
        const searchResults = document.getElementById("searchResults");
        searchResults.append(resultItem);
    });
}

function createResultItems(result) {
    const resultItem = document.createElement("div");
    resultItem.classList.add("resultItem");
    const resultTitle = document.createElement("div");
    resultTitle.classList.add("resultTitle");
    const link = document.createElement("a");
    link.href = `https://en.wikipedia.org/?curid=${result.id}`;
    link.textContent = result.title;
    link.target = "_blank";
    resultTitle.append(link);
    resultItem.append(resultTitle);
    return resultItem;
}

function createResultImage(result) {
    const img = document.createElement("img");
    img.src = result.img;
    img.alt = result.title;
    return img;
}

function createResultText(result) {
    const resultDescription = document.createElement("p");
    resultDescription.textContent = result.text;
    resultDescription.classList.add("resultDescription");
    return resultDescription;
}

function clearStatsLine() {
    document.getElementById("stats").textContent = "";
}

function setStatsLine(numberOfResults) {
    const statsLine = document.getElementById("stats");
    if (numberOfResults) {
        statsLine.textContent = `Displaying ${numberOfResults} results`;
    } else {
        statsLine.textContent = "Sorry, no results.";
    }
}

function extras() {
    document.getElementById("lan").addEventListener("click", (Lan) => {
        Lan = prompt("Which language can you write?", "Other than english and hindi");
        if (Lan == null) {
            alert("No problem. Go learn any one. Internet is for everyone.")
        } else {
            alert("Hmmmm...");
        }
    });

    document.getElementById("lucky").addEventListener("click", (event) => { alert("That's great..") });
}

function setSearchFocus() {
    document.getElementById("searchBar").focus();
}
