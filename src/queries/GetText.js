import gql from 'graphql-tag';

export default gql`
    query getTextOnPage($id: ID!) {
      getTextOnPage(id: $id) {
        id
        text
      }
    }
`;
