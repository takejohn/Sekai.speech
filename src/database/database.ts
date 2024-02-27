import mongoose from 'mongoose';

let url = 'mongodb://' + process.env.DATABASE_USERNAME;
url += ':' + process.env.DATABASE_PASSWORD;
url += '@' + process.env.DATABASE_HOSTNAME;
url += ':' + process.env.DATABASE_PORT;
url += '/' + process.env.DATABASE_NAME;
url += '?authSource=' + process.env.DATABASE_AUTHENTICATION_SOURCE;
mongoose.connect(url);

const wordSchema = new mongoose.Schema({
    client: String,
    guild: String,
    input: String,
    output: String,
});

export const wordModel = mongoose.model('WordModel', wordSchema);
