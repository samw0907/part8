import { useQuery } from '@apollo/client';
import { useState } from 'react';
import PropTypes from 'prop-types';
import { ALL_BOOKS } from './Queries';

const Books = (props) => {
  const [selectedGenre, setSelectedGenre] = useState('all')
  const { loading, error, data, refetch } = useQuery(ALL_BOOKS, {
    variables: { genre: selectedGenre === 'all' ? '' : selectedGenre },
  })

  if (!props.show) {
    return null
  }

  if (loading) return <p>Loading...</p>
  if (error) return <p>Error: {error.message}</p>

  const books = data.allBooks

  const genres = Array.from(new Set(books.flatMap(book => book.genres)))

  const filteredBooks = selectedGenre === 'all'
    ? books
    : books.filter(book => book.genres.includes(selectedGenre))

  const handleGenreChange = (genre) => {
    setSelectedGenre(genre)
    refetch({ genre: genre === 'all' ? '' : genre })
    }  

  return (
    <div>
      <h2>Books</h2>
      <table>
        <thead>
          <tr>
            <th>Title</th>
            <th>Author</th>
            <th>Published</th>
            <th>Genres</th>
          </tr>
        </thead>
        <tbody>
          {filteredBooks.map((book) => (
            <tr key={book.id}>
              <td>{book.title}</td>
              <td>{book.author.name}</td>
              <td>{book.published}</td>
              <td>{book.genres.join(', ')}</td>
            </tr>
          ))}
        </tbody>
      </table>
      <div>
        <button onClick={() => handleGenreChange('all')}>All Genres</button>
        {genres.map((genre) => (
          <button key={genre} onClick={() => handleGenreChange(genre)}>
            {genre}
          </button>
        ))}
      </div>
    </div>
  )
}

Books.propTypes = {
  show: PropTypes.bool.isRequired,
  refetch: PropTypes.func.isRequired,
}

export default Books