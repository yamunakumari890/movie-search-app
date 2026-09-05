
// ===============================
// MOVIE SEARCH APP
// ===============================

// OMDb API Key
const API_KEY = "87a4c25b";

const API_URL = "https://www.omdbapi.com/";


// ===============================
// DOM ELEMENTS
// ===============================

const searchInput = document.getElementById("search-input");
const searchBtn = document.getElementById("search-btn");

const movieContainer = document.getElementById("movie-container");

const searchResult = document.getElementById("search-result");

const loading = document.getElementById("loading");
const errorMessage = document.getElementById("error-message");

const favoriteCount = document.getElementById("favorite-count");


// ===============================
// FAVORITES
// ===============================

let favorites = JSON.parse(
    localStorage.getItem("favoriteMovies")
) || [];


// ===============================
// SEARCH BUTTON
// ===============================

searchBtn.addEventListener("click", () => {

    const movieName = searchInput.value.trim();

    if (movieName === "") {
        searchResult.textContent =
            "Please enter a movie name 🔍";

        return;
    }

    searchMovies(movieName);
});


// ===============================
// ENTER KEY SEARCH
// ===============================

searchInput.addEventListener("keydown", (event) => {

    if (event.key === "Enter") {

        const movieName = searchInput.value.trim();

        if (movieName === "") {
            searchResult.textContent =
                "Please enter a movie name 🔍";

            return;
        }

        searchMovies(movieName);
    }

});


// ===============================
// SEARCH MOVIES
// ===============================

async function searchMovies(movieName) {

    showLoading();

    hideError();

    movieContainer.innerHTML = "";

    try {

        const response = await fetch(
            `${API_URL}?apikey=${API_KEY}&s=${encodeURIComponent(movieName)}&type=movie`
        );

        const data = await response.json();


        // Check API response

        if (data.Response === "False") {

            throw new Error(
                data.Error || "Movie not found"
            );

        }


        // Get movie list

        const movies = data.Search;


        searchResult.textContent =
            `Found ${movies.length} results for "${movieName}"`;


        // Get detailed information

        const detailedMovies = await Promise.all(

            movies.slice(0, 12).map(movie =>
                getMovieDetails(movie.imdbID)
            )

        );


        displayMovies(detailedMovies);


    } catch (error) {

        console.error(error);

        showError();

        if(searchResult) {
        searchResult.textContent =
            "No movies found.";
        }
    } finally {

        hideLoading();

    }

}


// ===============================
// GET MOVIE DETAILS
// ===============================

async function getMovieDetails(imdbID) {

    const response = await fetch(
        `${API_URL}?apikey=${API_KEY}&i=${imdbID}&plot=short`
    );

    const data = await response.json();

    return data;

}


// ===============================
// DISPLAY MOVIES
// ===============================

function displayMovies(movies) {

    movieContainer.innerHTML = "";


    movies.forEach(movie => {

        if (movie.Response === "False") {
            return;
        }


        // Create movie card

        const movieCard = document.createElement("article");

        movieCard.classList.add("movie-card");


        // Poster

        const poster = document.createElement("img");

        poster.classList.add("movie-poster");

        poster.src =
            movie.Poster !== "N/A"
                ? movie.Poster
                : "https://via.placeholder.com/300x450?text=No+Poster";

        poster.alt = `${movie.Title} poster`;


        // Movie info

        const movieInfo = document.createElement("div");

        movieInfo.classList.add("movie-info");


        // Title

        const title = document.createElement("h2");

        title.classList.add("movie-title");

        title.textContent = movie.Title;


        // Favorite button

        const favoriteButton =
            document.createElement("button");

        favoriteButton.classList.add("favorite-btn");

        favoriteButton.innerHTML =
            isFavorite(movie.imdbID)
                ? "♥"
                : "♡";


        if (isFavorite(movie.imdbID)) {
            favoriteButton.classList.add("active");
        }


        favoriteButton.addEventListener(
            "click",
            () => toggleFavorite(movie, favoriteButton)
        );


        // Meta information

        const meta = document.createElement("div");

        meta.classList.add("movie-meta");


        const rating = document.createElement("span");

        rating.classList.add("rating");

        rating.textContent =
            movie.imdbRating !== "N/A"
                ? `⭐ ${movie.imdbRating}`
                : "⭐ N/A";


        const year = document.createElement("span");

        year.textContent =
            `• ${movie.Year}`;


        meta.appendChild(rating);
        meta.appendChild(year);


        // Genre

        const genreContainer =
            document.createElement("div");


        if (movie.Genre && movie.Genre !== "N/A") {

            const genres =
                movie.Genre.split(",").slice(0, 3);


            genres.forEach(genreName => {

                const genre =
                    document.createElement("span");

                genre.classList.add("genre");

                genre.textContent =
                    genreName.trim();

                genreContainer.appendChild(genre);

            });

        }


        // Add elements

        movieInfo.appendChild(title);

        movieInfo.appendChild(favoriteButton);

        movieInfo.appendChild(meta);

        movieInfo.appendChild(genreContainer);

        movieCard.appendChild(poster);

        movieCard.appendChild(movieInfo);

        movieContainer.appendChild(movieCard);

    });

}


// ===============================
// FAVORITE CHECK
// ===============================

function isFavorite(imdbID) {

    return favorites.some(
        movie => movie.imdbID === imdbID
    );

}


// ===============================
// TOGGLE FAVORITE
// ===============================

function toggleFavorite(movie, button) {

    const existingMovie =
        favorites.find(
            item => item.imdbID === movie.imdbID
        );


    if (existingMovie) {

        // Remove from favorites

        favorites =
            favorites.filter(
                item => item.imdbID !== movie.imdbID
            );

        button.innerHTML = "♡";

        button.classList.remove("active");

    } else {

        // Add to favorites

        favorites.push(movie);

        button.innerHTML = "♥";

        button.classList.add("active");

    }


    saveFavorites();

    updateFavoriteCount();

}


// ===============================
// SAVE FAVORITES
// ===============================

function saveFavorites() {

    localStorage.setItem(
        "favoriteMovies",
        JSON.stringify(favorites)
    );

}


// ===============================
// UPDATE FAVORITE COUNT
// ===============================

function updateFavoriteCount() {

    favoriteCount.textContent =
        favorites.length;

}


// ===============================
// LOADING
// ===============================

function showLoading() {

    loading.style.display = "block";

}


function hideLoading() {

    loading.style.display = "none";

}


// ===============================
// ERROR
// ===============================

function showError() {

    errorMessage.style.display = "block";

}


function hideError() {

    errorMessage.style.display = "none";

}


// ===============================
// INITIALIZE APP
// ===============================

updateFavoriteCount();


