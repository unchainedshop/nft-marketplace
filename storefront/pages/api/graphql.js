import graphqlServer from '../../api';

export default graphqlServer;

export const config = {
  api: {
    bodyParser: false,
  },
};
