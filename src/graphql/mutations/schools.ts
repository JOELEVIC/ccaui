import { gql } from "@apollo/client";

export const CREATE_SCHOOL = gql`
  mutation CreateSchool($input: CreateSchoolInput!) {
    createSchool(input: $input) {
      id
      name
      region
    }
  }
`;
