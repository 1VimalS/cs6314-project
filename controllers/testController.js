import SchemaInfo from '../schema/schemaInfo.js';
import User from '../schema/user.js';
import Photo from '../schema/photo.js';

export async function getInfo(req, res) {
    try {
        const info = await SchemaInfo.findOne().lean().exec();
        if (!info) {
            return res.status(500).send({ error: 'SchemaInfo not found' });
        }
        return res.status(200).send(info);
    } catch (err) {
        console.error('Error fetching SchemaInfo:', err);
        return res.status(500).send({ error: 'Internal server error' });
    }
}

// Returns an object with the counts of the different collections in JSON format.
export async function counts(req, res) {
    // Query counts from MongoDB using Mongoose models and return plain numbers
    try {
        const [userCount, photoCount, schemaInfoCount] = await Promise.all([
            User.countDocuments({}).exec(),
            Photo.countDocuments({}).exec(),
            SchemaInfo.countDocuments({}).exec(),
        ]);

        return res.status(200).send({
            user: userCount,
            photo: photoCount,
            schemaInfo: schemaInfoCount,
        });
    } catch (err) {
        console.error('Error fetching counts:', err);
        return res.status(500).send({ error: 'Internal server error' });
    }
}