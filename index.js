const { readFileSync } = require('fs');
const { createServer } = require('http');
const { title } = require('process');
const { Server } = require('socket.io');
const {data} = require('./data.js');
var url = require('url');
var t;
var msg;
var oscSig = {
  stage:0,
  intensity:0,
  colour:0
}

const httpServer = createServer((req, res) => {
 

  var urlStr = url.parse(req.url);
  
    // request page 
      if (req.method == "GET" && req.url == "/xia") {
        res.writeHead(200, { "content-type": "text/html" });
        require("fs").createReadStream("./index.html").pipe(res);
        console.log("open index.html");
    }
    // further req for other source such as .css .img 
      else if (req.method == "GET" ) {
        res.writeHead(200);
        require("fs").createReadStream('./style.css').pipe(res);
        require("fs").createReadStream('./TimesNewArialGX.ttf').pipe(res);// not getting ttf
        console.log("get"+'./TimesNewArialGX.ttf');
    }
  
  // slider texting with demo
  /* if (urlStr.pathname == '/api2') {
    const content = readFileSync('demo.html');
    const length = Buffer.byteLength(content);

    res.writeHead(200, {
      'Content-Type': 'text/html',
      'Content-Length': length,
    });
    res.end(content);
  }

  if (urlStr.pathname == '/api3') {
    // if(urlStr!=null){
    // const time = urlStr.query.split('=')[1];
    // }
    time = urlStr.query.split('=')[1];
    
    msg = 0; //data[Math.round(urlStr.query.split('=')[1]/8)];
  
    console.log('get time param :'+ time);
    console.log('get time param :'+ msg);
    
    if (t){
      clearInterval(t);
    }
    t = setInterval(() => {
      io.emit('blink-now', { timeToGlowInMs: 200, colour: "black" });
    },time);

    io.emit('text',(msg));

    res.writeHead(200,{'Content-Type':'text/plain'})
    res.write("recv");
    res.end();
  }*/
  
  //localhost:3000/osc
   if (urlStr.pathname == '/osc') {
    const content = readFileSync(process.cwd() +'/osc-web/web-side/app.html');
    const length = Buffer.byteLength(content);
    res.writeHead(200, {
      'Content-Type': 'text/html',
      'Content-Length': length,
    });
    res.end(content);
  }
  if (urlStr.pathname == '/getOsc') {
    // recieve whole property as object
    const oscCon = urlStr.query.split('=')[1]; 
    //dealing osc signal from oscapp
    if(oscCon.includes("scene")){
      console.log('get con :'+ oscCon);
      oscSig.stage=oscCon.split(',')[1];
    }
    if(oscCon.includes("intensity")){
      console.log('get con :'+ oscCon);
     oscSig.intensity=oscCon.split(',')[1];
    }
    if(oscCon.includes("color")){
      console.log('get con :'+ oscCon);
      var r = oscCon.split(',')[1]*255;
      var g = oscCon.split(',')[2]*255;
      var b = oscCon.split(',')[3]*255;
      var a = oscCon.split(',')[4];
      oscSig.colour ='rgba('+r+','+g+','+b+','+a+')';
    }
   
   // send signal to change color and indensity
    io.emit('osc',(oscSig));
    console.dir(oscSig,{depth: null});
  
   //-----! stage info predefine in data.js and send to fron directly//
    io.emit('text',(data[oscSig.stage]));
  
    io.emit();

    res.writeHead(200,{'Content-Type':'text/plain'});
    res.write("recv");
    res.end();
 
  }
});


const io = new Server(httpServer, {
  // Socket.IO options
});

io.on('connection', (socket) => {
  console.log(`connect ${socket.id}`);
  socket.on('disconnect', (reason) => {
    console.log(`disconnect ${socket.id} due to ${reason}`);
  });
});



httpServer.listen(3000);
