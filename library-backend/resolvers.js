const { PubSub } = require('graphql-subscriptions')
const { GraphQLError } = require('graphql')
const jwt = require('jsonwebtoken')
const Author = require('./models/Author')
const Book = require('./models/Book')
const User = require('./models/User')

const pubsub = new PubSub()

const resolvers = {
    Query: {
      authorCount: () => Author.countDocuments(),
      bookCount: () => Book.countDocuments(),
      allBooks: async (parent, args) => {
        const query = {}
        if (args.author) {
          const author = await Author.findOne({ name: args.author })
          if (author) {
            query.author = author._id
          }
        }
        if (args.genre) {
          query.genres = args.genre
        }
        return Book.find(query).populate('author')
      },
      allAuthors: async () => {
        return Author.find({}).populate('bookCount');
      },
      me: (root, args, context) => {
        return context.currentUser
      },
    },
  
    Mutation: {
      createUser: (root, args) => {
        const newUser = new User({ ...args })
        return newUser.save()
      }
      ,
  
      login: async (root, { username, password }) => {
        const user = await User.findOne({ username })
        if (!user || password !== "secret") {
            throw new GraphQLError('Invalid credentials', {
                extensions: { code: 'UNAUTHENTICATED' },
            })
        }
      
        const token = jwt.sign({ username: user.username, id: user.id }, process.env.JWT_SECRET)
        return { value: token }
      },
  
      addBook: async (parent, args, context) => {
        if (!context.currentUser) {
          throw new GraphQLError('Not authenticated', {
            extensions: { code: 'UNAUTHENTICATED' },
          });
        }
  
        let author = await Author.findOne({ name: args.author })
        if (!author) {
          author = new Author({ name: args.author })
          await author.save()
        }
  
        const book = new Book({
          title: args.title,
          published: args.published,
          author: author._id,
          genres: args.genres,
        });
        await book.save();
        const populatedBook = await book.populate('author')
        pubsub.publish('BOOK_ADDED', { bookAdded: populatedBook })
        return populatedBook
      },
      editAuthor: async (parent, args, context) => {
        if (!context.currentUser) {
          throw new GraphQLError('Not authenticated', {
            extensions: { code: 'UNAUTHENTICATED' }
          })
        }
        const author = await Author.findOne({ name: args.name })
        if (!author) return null
  
        author.born = args.setBornTo
        await author.save()
        return author
      }
    },
    Subscription: {
        bookAdded: {
          subscribe: () => pubsub.asyncIterator('BOOK_ADDED'),
        },
      },
}

module.exports = resolvers