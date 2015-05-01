// Generated by CoffeeScript 1.7.1
(function() {
  var bl, crypto, http, shelljs;

  http = require("http");

  shelljs = require("shelljs");

  crypto = require("crypto");

  bl = require('bl');

  http.createServer(function(request, response) {
    var tempstr;
    tempstr = '';
    request.pipe(bl(function(err, blob) {
      var currentDir, hexoCmd, hexoDir, hexoPostsDir, key, nvmCmd, pullCmd, result, secretHeader, signBlob, statusCode;
      console.log('init getRawBody');
      signBlob = function(key) {
        return 'sha1=' + crypto.createHmac('sha1', key).update(blob).digest('hex');
      };
      secretHeader = request.headers['x-hub-signature'];
      key = 'yan881224';
      statusCode = 505;
      tempstr = signBlob(key, blob);
      result = {
        success: false,
        errMsg: ''
      };
      currentDir = '' + shelljs.pwd();
      hexoPostsDir = "" + currentDir + "/../source/_posts";
      hexoDir = "" + currentDir + "/../";
      if (!(secretHeader && signBlob(key) === secretHeader + '')) {
        statusCode = 401;
        result = {
          success: false,
          errMsg: 'vertify failed'
        };
      } else {
        shelljs.cd(hexoPostsDir);
        pullCmd = shelljs.exec("ls & git pull origin master ");
        if (pullCmd.code === 0) {
          console.log("pull successed!");
          if (!(shelljs.which('node'))) {
            nvmCmd = shelljs.exec("nvm use 0.12");
          }
          shelljs.cd(hexoDir);
          hexoCmd = shelljs.exec("hexo clean & hexo generate");
          if (hexoCmd.code !== 0) {
            console.log("hexo generate failed!");
            statusCode = 503;
            result = {
              success: false,
              errMsg: 'hexo generage failed:' + hexoCmd.output
            };
          } else {
            console.log("hexo generate successed!");
            statusCode = 200;
            result = {
              success: true,
              errMsg: ''
            };
          }
        } else {
          console.log("pull posts failed");
          statusCode = 505;
          result = {
            success: false,
            errMsg: "pull posts failed:" + pullCmd.output
          };
        }
      }
      shelljs.cd(currentDir);
      response.writeHead(statusCode, {
        "Content-Type": "application/json"
      });
      response.end(JSON.stringify(secretHeader + '---' + signBlob(key)));
    }));
  }).listen(8888);

}).call(this);
