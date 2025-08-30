import { GridFSBucket } from 'mongodb';
let gfsBucket;

export const initGridFS = (conn) => {
  gfsBucket = new GridFSBucket(conn.db, { bucketName: 'uploads' });
  console.log('✅ GridFS initialized');
};

export const getGridFSBucket = () => gfsBucket;