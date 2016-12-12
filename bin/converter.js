/**
 * H2P - HTML to PDF PHP library
 *
 * JS Converter File
 *
 * LICENSE: The MIT License (MIT)
 *
 * Copyright (C) 2013 Daniel Garajau Pereira
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy of this
 * software and associated documentation files (the "Software"), to deal in the Software
 * without restriction, including without limitation the rights to use, copy, modify,
 * merge, publish, distribute, sublicense, and/or sell copies of the Software, and to
 * permit persons to whom the Software is furnished to do so, subject to the following
 * conditions:
 *
 * The above copyright notice and this permission notice shall be included in all copies
 * or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED,
 * INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A
 * PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT
 * HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION
 * OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE
 * SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
 *
 * @package    H2P
 * @author     Daniel Garajau <http://github.com/kriansa>
 * @copyright  2013 Daniel Garajau <http://github.com/kriansa>
 * @license    MIT License
 */


function waitFor(testFx, onReady, timeOutMillis) {
    var maxtimeOutMillis = timeOutMillis ? timeOutMillis : 300000, //< Default Max Timout is 3s
        start = new Date().getTime(),
        condition = false,
        interval = setInterval(function() {
            if ( (new Date().getTime() - start < maxtimeOutMillis) && !condition ) {
                // If not time-out yet and condition not yet fulfilled
                condition = (typeof(testFx) === "string" ? eval(testFx) : testFx()); //< defensive code
            } else {
                if(!condition) {
                    // If condition still not fulfilled (timeout but condition is 'false')
                    console.log(JSON.stringify({
                        success: false,
                        response: "'waitFor()' timeout"
                    }));
                    phantom.exit(1);
                } else {
                    // Condition fulfilled (timeout and/or condition is 'true')
                    console.log("'waitFor()' finished in " + (new Date().getTime() - start) + "ms.");
                    typeof(onReady) === "string" ? eval(onReady) : onReady(); //< Do what it's supposed to do once the condition is fulfilled
                    clearInterval(interval); //< Stop this interval
                }
            }
        }, 250); //< repeat check every 250ms
};

var page = require('webpage').create();
var args = require('system').args;

function numCallback(pageNum, numPages) {
    return "<div style='text-align:right;'><small>" + pageNum + " / " + numPages + "</small></div>";
}



function errorHandler(e) {
    console.log(JSON.stringify({
        success: false,
        response: e.toString()
    }));

    // Stop the script
    phantom.exit(0);
}

try {
    if (args.length < 3) {
        throw 'You must pass the URI and the Destination param!';
    }

    var uri = args[1];
    var destination = args[2];
    var format = args[3] || 'A4';
    var orientation = args[4] || 'portrait';
    var border = args[5] || '1cm';

    page.customHeaders = {
        'User-Agent': 'PhantomJS'
    };

    var today = new Date();
    var dd = today.getDate();
    var mm = today.getMonth()+1; //January is 0!
    var yyyy = today.getFullYear();
    var hh = today.getHours();
    var ss = today.getMinutes();
    var sec = today.getSeconds();

    if(dd<10) {
        dd='0'+dd;
    }

    if(mm<10) {
        mm='0'+mm;
    }

    if(ss<10) {
        ss='0'+ss;
    }

    if(sec<10) {
        sec='0'+sec;
    }
    today = dd+'/'+mm+'/'+ yyyy + " " + hh + 'h' + ss + ":" + sec;

    page.open(uri, function (status) {
        try {
            if (status !== 'success') {
                throw 'Unable to access the URI!';
            } else {
                waitFor(function() {
                    return page.evaluate(function() {
                        return !$("#footer").is(":visible");//&& $("#logo_pdf").is(":visible")
                    });
                }, function() {

                	page.paperSize = {
            			format: format, 
            			orientation: orientation, 
            			border: border,
            			margin: {left:"1cm", right:"1cm", top:"1cm", bottom:"0.5cm"},
            			footer: {
            		           height: "0.5cm",
            		           contents: phantom.callback(function(pageNum, numPages) {
            		                return "<div> <span style='text-align:center;font-family:arial;font-size:12px;'>© Formaeva  </span><span style='text-align:center;font-family:arial;font-size:8px;'>" + today + "</span><span style='float:right;font-family:arial;font-size:12px'>" + pageNum + " / " + numPages + "</span></div>";
            		            })
            			}
                	};

                    page.zoomFactor = 0;
                    page.render(destination, { format: 'pdf' });
        		   
        		   console.log(JSON.stringify({
        			   success: true,
        			   response: null
        		   }));
        		   
        		   // Stop the script
        		   phantom.exit(0);
        		   
                }, 300000);
            } 

        } catch (e) {
            errorHandler(e);
        }
    });
} catch (e) {
    errorHandler(e);
}