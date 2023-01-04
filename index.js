const { SelfieToAnime } = require("./SelfieToAnime");
const fs = require("fs");

const express = require('express')
const app = express()
const port = 6969

app.use(express.json({limit: '50mb'}));
app.use(express.urlencoded({limit: '50mb'}));

app.get('/', (req, res) => {
  res.send('Hello World!')
})

app.post('/toAnime', (req, res) => {
  console.log("Got a request")
  if (req.body.image == null || req.body.image.length == 0) {
      res.status(400).send('Please add an image to your request')
  }else{    
    SelfieToAnime({
      photo: req.body.image,
      destinyFolder: "./output"
    }).then((data) => {
      console.log(data.url);
      res.status(200).send(data)
    })
  }
})

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
})

/* const { AnimeData } = require("@dovakiin0/anime-data");

const anime = new AnimeData();
anime
  .searchAnime("oregairu")
  .then((res) => {
    // console.log(res)
    // list of anime that matches the search
    anime.getAnimeInfo(res[0].link).then((info) => {
      // console.log(info);
      // Anime details
      anime.getEpisode(info.slug, 1).then((episode) =>
        // gets the specific episode of the anime
        console.log(episode)
      );
    });
  })
  .catch((err) => console.log(err)); */
