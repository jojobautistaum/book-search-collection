import { gql } from "@apollo/client";

export const QUERY_ME = gql`
  query me($id: ID!) {
    user(_id: $id) {
      _id
      username
      email
      bookCount
      saveBooks {
        bookId
        authors
        description
        image
        link
        title
      }
    }
  }
`;
