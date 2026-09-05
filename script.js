const API_KEY = "87a4c25b";

const API_URL = "https://www.omdbapi.com/";

const searchInput = document.getElementById("search-input");
const searchBtn = document.getElementById("search-btn");

const movieContainer = document.getElementById("movie-container");

const searchResult = document.getElementById("search-result");

const loading = document.getElementById("loading");
const errorMessage = document.getElementById("error-message");

const favoriteCount = document.getElementById("favorite-count");

let favorites = JSON.parse(
    localStorage.getItem("favoriteMovies")
) || [];

searchBtn.addEventListener("click", () => {

    const movieName = searchInput.value.trim();

    if (movieName === "") {
        searchResult.textContent =
            "Please enter a movie name 🔍";

        return;
    }

    searchMovies(movieName);
});

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

async function searchMovies(movieName) {

    showLoading();

    hideError();

    movieContainer.innerHTML = "";

    try {

        const response = await fetch(
            `${API_URL}?apikey=${API_KEY}&s=${encodeURIComponent(movieName)}&type=movie`
        );

        const data = await response.json();

        if (data.Response === "False") {

            throw new Error(
                data.Error || "Movie not found"
            );

        }

        const movies = data.Search;


        searchResult.textContent =
            `Found ${movies.length} results for "${movieName}"`;

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

async function getMovieDetails(imdbID) {

    const response = await fetch(
        `${API_URL}?apikey=${API_KEY}&i=${imdbID}&plot=short`
    );

    const data = await response.json();

    return data;

}

function displayMovies(movies) {

    movieContainer.innerHTML = "";


    movies.forEach(movie => {

        if (movie.Response === "False") {
            return;
        }

        const movieCard = document.createElement("article");

        movieCard.classList.add("movie-card")

        const poster = document.createElement("img");

        poster.classList.add("movie-poster");

        poster.src =
            movie.Poster !== "N/A"
                ? movie.Poster
                : "https://via.placeholder.com/300x450?text=No+Poster";

        poster.alt = `${movie.Title} poster`;

        const movieInfo = document.createElement("div");

        movieInfo.classList.add("movie-info");

        const title = document.createElement("h2");

        title.classList.add("movie-title");

        title.textContent = movie.Title;


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

        movieInfo.appendChild(title);

        movieInfo.appendChild(favoriteButton);

        movieInfo.appendChild(meta);

        movieInfo.appendChild(genreContainer);

        movieCard.appendChild(poster);

        movieCard.appendChild(movieInfo);

        movieContainer.appendChild(movieCard);

    });

}

function isFavorite(imdbID) {

    return favorites.some(
        movie => movie.imdbID === imdbID
    );

}

function toggleFavorite(movie, button) {

    const existingMovie =
        favorites.find(
            item => item.imdbID === movie.imdbID
        );


    if (existingMovie) {

        favorites =
            favorites.filter(
                item => item.imdbID !== movie.imdbID
            );

        button.innerHTML = "♡";

        button.classList.remove("active");

    } else {

        favorites.push(movie);

        button.innerHTML = "♥";

        button.classList.add("active");

    }

    saveFavorites();

    updateFavoriteCount();

}

function saveFavorites() {

    localStorage.setItem(
        "favoriteMovies",
        JSON.stringify(favorites)
    );

}

function updateFavoriteCount() {

    favoriteCount.textContent =
        favorites.length;
}

function showLoading() {

    loading.style.display = "block";

}

function hideLoading() {

    loading.style.display = "none";

}

function showError() {

    errorMessage.style.display = "block";

}

function hideError() {

    errorMessage.style.display = "none";

}

updateFavoriteCount();


