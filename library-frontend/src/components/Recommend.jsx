import { useQuery } from '@apollo/client'
import { useEffect, useState } from 'react'
import { RECOMMEND_BOOKS } from './Queries'

const Recommend = ({ show, user }) => {
  const [selectedGenre, setSelectedGenre] = useState('')
  const { data, loading, error } = useQuery(RECOMMEND_BOOKS, {
    variables: { genre: selectedGenre },
    skip: !selectedGenre,
  })

  useEffect(() => {
    if (user && user.favoriteGenre) {
      setSelectedGenre(user.favoriteGenre)
    }
  }, [user])

  if (!show) {
    return null
  }

  if (loading) return <p>Loading...</p>
  if (error) return <p>Error: {error.message}</p>

  const books = data ? data.allBooks : []

  return (
    <div>
      <h2>Recommended Books</h2>
      {user && <h3>Based on your favorite genre: {user.favoriteGenre}</h3>}
      <table>
        <tbody>
          <tr>
            <th>Title</th>
            <th>Author</th>
            <th>Published</th>
            <th>Genres</th>
          </tr>
          {books.map((book) => (
            <tr key={book.id}>
              <td>{book.title}</td>
              <td>{book.author.name}</td>
              <td>{book.published}</td>
              <td>{book.genres.join(', ')}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

export default Recommend