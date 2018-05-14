import gql from 'graphql-tag';

export default gql`
  subscription onUpdateTextOnPage($id: ID!) {
    onUpdateTextOnPage(id: $id) {
      text
    }
  }
`;
