const express = require('express');
const reload = require('reload');
const http = require('http');

const app = express();
app.use(express.static('public'));

app.get('/', function (req, res) {
   res.sendFile( __dirname + "/" + "index.html" );
})

app.set('port', process.env.PORT || 3001);

const server = http.createServer(app)

reload(server, app);

server.listen(app.get('port'), function(){
  console.log("Web server listening on port " + app.get('port'));
});
