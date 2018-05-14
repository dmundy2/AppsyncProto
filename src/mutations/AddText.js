import gql from 'graphql-tag';

export default gql`
  mutation addText($id: ID!, $text: String!) {
    createTextOnPage(
      input: {
        id: $id,
        text: $text
      }
    ) {
        id
        text
      }
  }
`;
