// Array of IDs of the watchlist movies
export let watchlistMoviesImdbIDs

// Locating some elements
const searchBtn = document.getElementById('search-btn')
const searchInput = document.getElementById('search-input')
const mainMoviesSect = document.getElementById('movies')

if (searchBtn && searchInput) {
    // Search Event handler for search button
    searchBtn.addEventListener('click', () => showResults())
    // Click enter to search input show results
    searchInput.addEventListener('keypress', (e) => { if (e.code === 'Enter') { showResults() } })
}

document.addEventListener('click', (e) => {
    // handel read more button
    if (e.target.className === 'read-more-btn') {
        const holder = e.target.parentElement
        const desc = holder.querySelector('.description')
        desc.classList.toggle('turncated')
        const btnText = e.target.textContent === 'Read more' ? 'Read less' : 'Read more'
        e.target.textContent = btnText
    }
})

if (mainMoviesSect) {
    mainMoviesSect.addEventListener('click', (e) => {
        if (e.target.classList.contains('add-movie')) {
            addMovieToWatchlist(e.target.dataset.target)
            showResults()
            updateLocalWatchlist()
        } else if (e.target.classList.contains('remove-movie')) {
            removeMovieFromWatchlist(e.target.dataset.target)
            showResults()
            updateLocalWatchlist()
        }
    })
}

document.addEventListener('DOMContentLoaded', () => { watchlistMoviesImdbIDs = handelLocalWatchlist() })

export function handelLocalWatchlist() {
    const watchlistLocal = JSON.parse(localStorage.getItem('watchlist'))
    if (watchlistLocal) {
        return watchlistLocal
    } else {
        localStorage.setItem('watchlist', JSON.stringify([]))
        return []
    }
}

export function updateLocalWatchlist() {
    localStorage.setItem('watchlist', JSON.stringify(watchlistMoviesImdbIDs))
}

// show results or status of the search
async function showResults() {
    const search = document.getElementById('search-input').value
    const searchResult = await getSearchResultArr(search)
    if (searchResult) {
        const imdbIDs = await getImdbIDs(searchResult)
        const movies = await getMovies(imdbIDs)
        renderMovies(getMoviesHtml(movies))
    } else {
        document.getElementById('movies').innerHTML =
            `<p class='no-data'>Unable to find what you’re looking for.<br>Please try another search.</p>`
    }
}

// get the search result
async function getSearchResultArr(search) {
    try {
        const res = await fetch(`https://www.omdbapi.com/?s=${search}&apikey=ab1918a1`)
        if (!res.ok) {
            throw Error('Not found')
        }
        const data = await res.json()
        return data.Search
    } catch (e) {
        console.log(e)
    }
}

// get the imbdIds from the search result
function getImdbIDs(searchArr) {
    return searchArr.map(item => item.imdbID)
}

// get all movies using imdbIds
export function getMovies(imdbIDs) {
    // this method return an array of unsolved promises
    // const movies = []
    // imdbIDs.forEach(async (id) => {
    //     movies.push(await getMovieById(id))
    // })

    // return movies

    // this one wait for fetch all promises and solve it an give us a sing array of movies
    return Promise.all(imdbIDs.map(id => getMovieById(id)))
}

// get each movie with it's specific id
async function getMovieById(id) {
    try {
        const res = await fetch(`https://www.omdbapi.com/?i=${id}&apikey=ab1918a1`)

        if (!res.ok) {
            throw Error('Not found')
        }
        const data = await res.json()
        const parameters = [data.Poster, data.Title, data.imdbRating, data.Runtime, data.Plot]
        // Check for 'N/A' in required fields
        if (parameters.includes('N/A')) {
            return false
        }
        if (data.Poster && data.Poster !== 'N/A') {
            const imageExists = await new Promise(resolve => {
                const img = new window.Image()
                img.onload = () => resolve(true)
                img.onerror = () => resolve(false)
                img.src = data.Poster
            })

            if (!imageExists) {
                return false
            }

        }
        return data

    } catch (e) {
        // console.error(e)
        return false
    }
}

export function getMoviesHtml(movies) {

    return movies.map(movie => {
        if (movie) {
            return `<div class="movie">
                        <img src="${movie.Poster}">
                        <div class="movie-details">
                            <div class="name-rate">
                                <h2 class="movie-name">${movie.Title}</h2>
                                <div class="rate-holder">
                                    <i class="fa-solid fa-star"></i>
                                    <span class="rate">${movie.imdbRating}</span>
                                </div>
                            </div>
                            <div class="movie-info">
                                <span class="time">${movie.Runtime}</span>
                                <span class="type">${movie.Type}</span>
                                <div class="add-to-watchlis">
                                    ${isInWatchlist(movie.imdbID)}
                                    <span>Watchlist</span>
                                </div>
                            </div>
                            <div class='description-holder'>
                                <p class='description'>${movie.Plot}</p>
                            </div>
                        </div>
                    </div>`
        }
    }).join('')

}

// check if movie in watchlist movies
function isInWatchlist(movieImdbID) {
    if (watchlistMoviesImdbIDs.includes(movieImdbID)) {
        return `<i class="fa-solid fa-circle-minus remove-movie" data-target='${movieImdbID}'></i>`
    }
    return `<i class="fa-solid fa-circle-plus add-movie" data-target='${movieImdbID}'></i>`
}

// add movie to watchlist
function addMovieToWatchlist(movieImdbID) {
    if (!watchlistMoviesImdbIDs.includes(movieImdbID)) {
        watchlistMoviesImdbIDs.unshift(movieImdbID)
    }
}

// remove movie from watchlist
export function removeMovieFromWatchlist(movieImdbID) {
    if (watchlistMoviesImdbIDs.includes(movieImdbID)) {
        // remove the movie from the watchlist
        watchlistMoviesImdbIDs = watchlistMoviesImdbIDs.filter(movieId => movieId !== movieImdbID)
    }
}

// get the description html of the movie
export function getMovieDescription(description) {
    const lineHeight = parseFloat(getComputedStyle(description).lineHeight);
    const maxHeight = lineHeight * 3
    const holderHeight = description.scrollHeight

    // If expanded false will do nothing
    if (holderHeight > maxHeight) {
        description.classList.add('turncated')

        description.parentElement.innerHTML += `<span class='dots'>...</span>
                                                <button class='read-more-btn'>Read more</button>`
    }

}

function renderMovies(html) {
    document.getElementById('movies').innerHTML = html
    document.querySelectorAll('.description').forEach(description => getMovieDescription(description))
}