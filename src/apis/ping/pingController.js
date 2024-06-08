import { hashValue } from '../../utils/auth';

const pong = (req, res) => res.status(200).send('Ping Pong...');

const hash = (req, res) => {
  const value = hashValue(req.params.id);
  res.status(200).send(value);
};

export { pong, hash };
