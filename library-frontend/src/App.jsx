import { useState } from "react"
import Authors from "./components/Authors"
import Books from "./components/Books"
import NewBook from "./components/NewBook"
import LoginForm from "./components/LoginForm"
import Notify from "./components/Notify"
import Recommend from "./components/Recommend"
import { useQuery, useApolloClient, useSubscription } from "@apollo/client"
import { ALL_BOOKS, BOOK_ADDED, ME } from "./components/Queries"

export const updateCache = (cache, query, addedBook) => {
  const uniqByName = (a) => {
    let seen = new Set()
    return a.filter((item) => {
      let k = item.name
      return seen.has(k) ? false : seen.add(k)
    })
  }

  console.log(query)

  cache.updateQuery(query, ({ allBooks }) => {
    return {
      allBooks: uniqByName(allBooks.concat(addedBook)),
    }
  })
}

const App = () => {
  const [page, setPage] = useState("authors")
  const [token, setToken] = useState(null)
  const [errorMessage, setErrorMessage] = useState(null)

  const client = useApolloClient()
  
  const { loading, refetch } = useQuery(ALL_BOOKS)

  const { data: userData } = useQuery(ME, {
    skip: !token,
  })

  useSubscription(BOOK_ADDED, {
    onData: ({ data }) => {
      const addedBook = data.data.bookAdded;
      console.log(addedBook)
      window.alert(`${addedBook.title} added`)

      updateCache(client.cache, { query: ALL_BOOKS }, addedBook)
      refetch()
    },
  })

  if (loading) {
    return <div>loading...</div>
  }

  const logout = () => {
    setToken(null);
    localStorage.clear()
    client.resetStore()
  }

  const user = userData ? userData.me : null;

  return (
    <div>
      <div>
        <button onClick={() => setPage("authors")}>authors</button>
        <button onClick={() => setPage("books")}>books</button>
        <button onClick={() => setPage("add")} disabled={!token}>
          add book
        </button>
        <button onClick={() => setPage("recommend")} disabled={!token}>
          recommend
        </button>
      </div>

      {token && (
        <div>
          <button onClick={logout}>logout</button>
        </div>
      )}

      {!token && (
        <>
          <Notify errorMessage={errorMessage} />
          <LoginForm setToken={setToken} setError={setErrorMessage} />
        </>
      )}
      
      <Authors show={page === "authors"} />
      <Books show={page === "books"} refetch={refetch} />
      <NewBook show={page === "add"} refetch={refetch} />
      <Recommend show={page === "recommend"} user={user} />
    </div>
  )
}

export default App
