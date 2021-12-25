const URL = require("./models/url"),
  rp = require("request-promise"),
  axios = require("axios"),
  Handlebars = require("handlebars"),
  // querystring = require('querystring'),
  // url = require('url'),
  fs = require("fs");

const API_KEY = process.env.YT_DATA_API_KEY;
let titleTemp;


exports.getHello = function (req, res) {

  console.log("i am at getHello");

  //sample res at index.html
  const id = "618d3c044abc111ce74e2b9f";  
  console.log(id);

    (async () => {
      try {
        const {data} = await axios.get('https://ytt-api.herokuapp.com/ytt/api/' + id + '?full=true');

        if(data) {
          
          data.videoId = data.videoId;
          data.title = data.title;
          data.url = data.url;
          
          let readStream = fs.createReadStream(__dirname + '/views/index.html');
          readStream.on('close', () => {
            res.end()
          })

          var source = fs.readFileSync(__dirname + "/views/index.handlebars", "utf8");
          var template = Handlebars.compile(source);
          // res.end(template(data).toString());

          readStream.pipe(res.end(template(data).toString()))
          
        }
      } catch (error) {
        console.log(error);
        return res.redirect("/error/" + "No data found")
      }
    })();

};

exports.getSearch = function (req, res) {

  console.log(req.query.q)
  // console.log(req.params.id)
  // const API_KEY = process.env.YT_DATA_API_KEY;
  const Q_URL = encodeURI("https://www.googleapis.com/youtube/v3/search?key=" + API_KEY 
  + "&type=video&part=snippet&maxResults=" + 8 
  + "&q=" + req.query.q);
  // console.log(Q_URL)

  let videos;
  (async () => {
    try {
      
      const { data } = await axios.get(Q_URL);  // const { data } = await axios.got.get(Q_URL);
      // console.log(data)

      videos = data.items;
      // videos = JSON.parse(JSON.stringify(data.items));
      // console.log(videos)

      var source = fs.readFileSync(__dirname + "/views/js/search.handlebars", "utf8");
      var template = Handlebars.compile(source);
      res.end(template(videos).toString());

    } catch (error) {
      console.log(error);
      // res.write(error)
    }
  })();


};

exports.getError = function (req, res) {
  console.log("error msg at getError: " + req.params.id)

  if(req.params.id === "No captions found") {
     return res.sendFile(__dirname + "/views/js/No_captions_found.html")
  }
  if(req.params.id === "No data found") {
    return res.sendFile(__dirname + "/views/js/No_data_found.html")
 }
//  if(req.params.id === "res.status(400).json(err)") {
//   return res.sendFile(__dirname + "/views/js/No_data_found.html")
// }

}


exports.getDoc = function (req, res) {
 

  //need to add some big butns as a link
  //where each link redirect to each of the endpoints

  if(req.query.q === "scripts") {

    // console.log(data)
    (async () => {
      try {
        
        // /ytt/api/:id/scripts
        //this wway works, url (http status) is too long, though.
        const {data} = await axios.get('https://ytt-api.herokuapp.com/ytt/api/' + req.params.id + '/scripts');
        if(data) {
          
          data.videoId = req.query.videoId;
          data.title = titleTemp;
          data.url = req.query.url;
          // console.log(data)

          var source = fs.readFileSync(__dirname + "/views/js/my.handlebars", "utf8");
          var template = Handlebars.compile(source);
          res.end(template(data).toString());
          
        }
      } catch (error) {
        console.log(error);
      }
    })();

  }

};

exports.postDoc = function (req, res) {
  
  const url = JSON.parse(JSON.stringify(req.body.url));
  // console.log("console.log(url) at POST: " + url);

  let hasData;

  (async () => {
    
    try {
      
      /**
       * via the API, available script data will be returned
       */
      const {data} = await axios.get('https://ytt-api.herokuapp.com/ytt/api?url=' + url);  
      
      if(data) {
        hasData = true;
        console.log("\n" + hasData)
        titleTemp = data.title;
        res.redirect("/ytt/" + data._id + "?q=scripts&videoId=" + data.videoId + "&url=" + url);  // getDoc
        
      }
    } catch (error) {
      console.log(error);
      hasData = false;
      console.log("\n" + hasData)
      return res.redirect("/error/" + "No captions found")
      // return res.redirect("/error/" + "No data found")
    }
  })();

};

//Since getDocs is not the main endpoint compared to getDoc,
//getDocs only returns JSON docs existing in the DB to the browser
//if decided to add it on deploying.
exports.getDocs = function (req, res) {
 
  (async () => {   
    try {
      const {data} = await axios.get('https://ytt-api.herokuapp.com/ytt/api/all');  
      
      if(data) {

        res.writeHead(200, {
          'Content-Type': 'text/plain; charset=utf-8',
          'Content-Type': 'application/json'
        });
        // res.setEncoding('utf8');
        // res.charset = 'utf-8';
        res.end(JSON.stringify(data, null, 4));        
      }
    } catch (error) {
      console.log(error);
      return res.redirect("/error/" + "No data found")
    }
  })();
  
};