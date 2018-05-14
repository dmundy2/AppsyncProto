import gql from 'graphql-tag';

export default gql`
  mutation updateText($id: ID!, $text: String!) {
    updateTextOnPage(
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
