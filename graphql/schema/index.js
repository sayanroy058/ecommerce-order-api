const { gql } = require('apollo-server-express');
const types = require('./types');
const queries = require('./queries');
const mutations = require('./mutations');

const schema = gql`
  ${types}
  ${queries}
  ${mutations}
`;

console.log("✅ Final Merged Schema:\n", schema); // Debugging

module.exports = schema;
