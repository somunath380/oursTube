// Express server snippet to serve the folder
const express = require("express")
const path = require('path')
const cors = require("cors")

const app = express();
const PORT = 3000;
const corsOptions = {
    origin: "*",
    methods: ["*"]
}

app.use(cors(corsOptions))

app.use('/hls', express.static(path.join('/home/lonewolf/Videos/Screencasts', 'hls')))

app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
