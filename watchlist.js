import { getMovies, getMoviesHtml, watchlistMoviesImdbIDs } from './index.js'

document.addEventListener('DOMContentLoaded', renderWatchlistMovies())

// render watchlist html
async function renderWatchlistMovies() {
    if (watchlistMoviesImdbIDs.length === 0) {
        document.getElementById('watchlist-movies').innerHTML = `<p class='empty-watchlist'>Your watchlist is looking a little empty...</p>
                                                                <div class='search-more'>
                                                                    <a href='./index.html'><i class="fa-solid fa-circle-plus search-more-icon"></i></a>
                                                                    <span class='search-more-txt'>Let’s add some movies!</span>
                                                                </div>`
    } else {
        const movies = await getMovies(watchlistMoviesImdbIDs)
        document.getElementById('watchlist-movies').innerHTML = getMoviesHtml(movies)
        document.querySelectorAll('.description').forEach(description => getMovieDescription(description))
    }
}