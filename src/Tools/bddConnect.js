const mongoose = require('mongoose');
require('dotenv').config();

const uri = `mongodb+srv://${process.env.MONGO_USER}:${process.env.MONGO_PW}@membercatchds.hgsxwqb.mongodb.net/MemberCatch?retryWrites=true&w=majority&appName=MemberCatchDS`;

mongoose.connect(uri)
    .then(() => {
        console.log('Connexion réussie à la base de données !');
    })
    .catch((error) => {
        console.error('Erreur de connexion à la base de données :', error);
    });

module.exports = mongoose;