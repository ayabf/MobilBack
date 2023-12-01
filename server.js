const express = require('express');
const app = express();
const port = process.env.PORT || 3001;

// Route de base
app.get('/', (req, res) => {
    res.send('Test Node js server');
});


app.listen(port, () => {
    console.log(`Serveur en cours d'écoute sur le port ${port}`);
});
