import { useQuery, useMutation } from '@apollo/client';
import { useState } from 'react';
import PropTypes from 'prop-types';
import { ALL_AUTHORS, EDIT_AUTHOR } from './Queries';

const Authors = (props) => {
  const { loading, error, data } = useQuery(ALL_AUTHORS);
  const [editAuthor] = useMutation(EDIT_AUTHOR);
  const [birthYear, setBirthYear] = useState('');
  const [selectedAuthor, setSelectedAuthor] = useState('');

  if (!props.show) {
    return null;
  }
  if (loading) return <p>Loading...</p>;
  if (error) return <p>Error: {error.message}</p>;

  const authors = data.allAuthors;

  const handleBirthYearChange = () => {
    if (selectedAuthor && birthYear) {
      editAuthor({ variables: { name: selectedAuthor, setBornTo: parseInt(birthYear) } })
        .then(() => {
          console.log(`Birth year for ${selectedAuthor} updated`);
          setBirthYear('');
          setSelectedAuthor('');
        })
        .catch((error) => {
          console.error('Error updating birth year:', error);
        });
    }
  };

  return (
    <div>
      <h2>authors</h2>
      <table>
        <tbody>
          <tr>
            <th>name</th>
            <th>born</th>
            <th>books</th>
          </tr>
          {authors.map((a) => (
            <tr key={a.name}>
              <td>{a.name}</td>
              <td>{a.born}</td>
              <td>{a.bookCount}</td>
            </tr>
          ))}
        </tbody>
      </table>
      <h3>Set birthyear</h3>
      <div>
        <label>
          name:
          <select
            value={selectedAuthor}
            onChange={({ target }) => setSelectedAuthor(target.value)}
          >
            <option value="">Select author</option>
            {authors.map((a) => (
              <option key={a.name} value={a.name}>
                {a.name}
              </option>
            ))}
          </select>
        </label>
      </div>
      <div>
        <label>
          born:
          <input
            type="number"
            placeholder="Enter new birth year"
            value={birthYear}
            onChange={({ target }) => setBirthYear(target.value)}
          />
        </label>
      </div>
      <button onClick={handleBirthYearChange}>
        Update Author
      </button>
    </div>
  );
};

Authors.propTypes = {
  show: PropTypes.bool.isRequired,
};

export default Authors;
