import { useState } from 'react'
import { useMutation } from '@apollo/client'
import PropTypes from 'prop-types'
import { updateCache } from '../App'
import { ALL_BOOKS, ADD_BOOK } from './Queries'

const NewBook = ({ show, refetch }) => {
  const [title, setTitle] = useState('')
  const [author, setAuthor] = useState('')
  const [published, setPublished] = useState('')
  const [genre, setGenre] = useState('')
  const [genres, setGenres] = useState([])

  const [addBook] = useMutation(ADD_BOOK, {
    onCompleted: () => {
      setTitle('')
      setPublished('')
      setAuthor('')
      setGenres([])
      setGenre('')
      refetch()
    },
    update: (cache, response) => {
      updateCache(cache, { query: ALL_BOOKS, variables: { genre: ''} }, response.data.addBook)
    },
  })

  if (!show) {
    return null
  }

  const submit = async (event) => {
    event.preventDefault()

    addBook({
      variables: {
        title,
        author,
        published: parseInt(published),
        genres,
      },
    })
  }

  const addGenre = () => {
    setGenres([...genres, genre])
    setGenre('')
  }
  return (
    <div>
      <form onSubmit={submit}>
        <div>
          title
          <input
            value={title}
            onChange={({ target }) => setTitle(target.value)}
          />
        </div>
        <div>
          author
          <input
            value={author}
            onChange={({ target }) => setAuthor(target.value)}
          />
        </div>
        <div>
          published
          <input
            type="number"
            value={published}
            onChange={({ target }) => setPublished(target.value)}
          />
        </div>
        <div>
          <input
            value={genre}
            onChange={({ target }) => setGenre(target.value)}
          />
          <button onClick={addGenre} type="button">
            add genre
          </button>
        </div>
        <div>genres: {genres.join(' ')}</div>
        <button type="submit">create book</button>
      </form>
    </div>
  )
}

NewBook.propTypes = {
  show: PropTypes.bool.isRequired,
  refetch: PropTypes.func.isRequired
}

export default NewBook