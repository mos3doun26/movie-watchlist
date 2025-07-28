import { getMovies, getMoviesHtml, watchlistMoviesImdbIDs, getMovieDescription, removeMovieFromWatchlist, updateLocalWatchlist } from './index.js'

document.addEventListener('DOMContentLoaded', async () => renderWatchlistMovies())

document.getElementById('watchlist-movies').addEventListener('click', (e) => {
    if (e.target.classList.contains('remove-movie')) {
        removeMovieFromWatchlist(e.target.dataset.target)
        updateLocalWatchlist()
        renderWatchlistMovies()
    }
})


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