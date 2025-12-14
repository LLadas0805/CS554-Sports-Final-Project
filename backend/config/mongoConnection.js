import { MongoClient } from 'mongodb';
import dotenv from 'dotenv';

dotenv.config();

let _connection = null;
let _db = null;

const dbConnection = async () => {
  const mongoUri = process.env.MONGODB_URI;

  if (!_connection) {
    _connection = await MongoClient.connect(mongoUri, {
      tls: true,                     
      tlsAllowInvalidCertificates: false, 
    });
    _db = _connection.db(); 
    
  }

  return _db;
};

const closeConnection = async () => {
  if (_connection) {
    await _connection.close();
    _connection = null;
    _db = null;
  }
};

export { dbConnection, closeConnection };
