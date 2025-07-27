// Search Event handler for search button
document.getElementById('search-btn').addEventListener('click', () => showResults())
// Click enter to search input show results
document.getElementById('search-input').addEventListener('keypress', (e) => { if (e.code === 'Enter') { showResults() } })

// handel read more button
document.addEventListener('click', (e) => {
    if (e.target.className === 'read-more-btn') {
        const holder = e.target.parentElement
        const desc = holder.querySelector('.description')
        desc.classList.toggle('turncated')
        const btnText = e.target.textContent === 'Read more' ? 'Read less' : 'Read more'
        e.target.textContent = btnText
    }
})

// show results or status of the search
async function showResults() {
    const search = document.getElementById('search-input').value
    document.getElementById('search-input').value = ''
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
    const res = await fetch(`https://www.omdbapi.com/?s=${search}&apikey=ab1918a1`)
    const data = await res.json()
    return data.Search
}

// get the imbdIds from the search result
function getImdbIDs(searchArr) {
    return searchArr.map(item => item.imdbID)
}

// get all movies using imdbIds
function getMovies(imdbIDs) {
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
    const res = await fetch(`https://www.omdbapi.com/?i=${id}&apikey=ab1918a1`)
    return await res.json()
}

function getMoviesHtml(movies) {

    return movies.map(movie => {
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
                                <i class="fa-solid fa-circle-plus"></i>
                                <span>Watchlist</span>
                            </div>
                        </div>
                        <div class='description-holder'>
                            <p class='description'>${movie.Plot}</p>
                        </div>
                    </div>
                </div>`
    }).join('')

}

// get the description html of the movie
function getMovieDescription(description) {
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