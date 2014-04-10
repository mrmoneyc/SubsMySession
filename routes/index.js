var express = require('express');
var router = express.Router();
var fs = require('fs');
var path = require('path');
var vobj = require('vobject');
var db = require('../db.js');
db.open( function (dbErr, data) {
  if (dbErr) {
    console.log(dbErr);
  }
  else {
    console.log('DB connected');
  }
});
var clt = {};
clt.ssn = db.collection('session');

/* GET home page. */
router.get('/', function(req, res) {
  var ssnData = [];
  clt.ssn.find().sort({ _sid: 1 }).toArray( function (err, data) {
    if (!data) {
      console.log('DATA CANNOT FOUND :: ', err);
      ssnData = [];
    }
    else {
      //console.dir(data);
      ssnData = data;
    }

    res.render('index', {
      title: 'OSDC.tw 2014',
      ssnData: ssnData
    });
  });
});

router.post('/gencal', function (req, res) {
  var qCondition = req.param('sid');
  var lstEvent = [];
  var tNow = (new Date()).getTime();

  var cal = vobj.calendar();
  cal.setMethod('REQUEST');

  //console.log(typeof qCondition);
  clt.ssn.find({ sid: { $in: qCondition }}).sort({ _sid: 1 }).toArray( function (err, data) {
    if (!data) {
      console.log('DATA CANNOT FOUND :: ', err);
    }
    else {
      //console.dir(data);
      lstEvent = data;

      for (var i = 0; i < lstEvent.length; i += 1) {
        var e = vobj.event();
        e.setSummary(lstEvent[i].title);
        e.setDescription(lstEvent[i].desc);
        var dtStart = vobj.dateTimeValue(lstEvent[i].dtStart);
        dtStart.setTZID('Asia/Taipei');
        e.setDTStart(dtStart);
        var dtEnd = vobj.dateTimeValue(lstEvent[i].dtEnd);
        dtEnd.setTZID('Asia/Taipei');
        e.setDTEnd(dtEnd);
        e.setLocation(lstEvent[i].location);

        cal.pushComponent(e);

        delete e, dtStart, dtEnd;
      }

      var strICS = cal.toICS();
      var arrStrICS = strICS.split('\r\n');
      //var strVALARM = 'BEGIN:VALARM\r\nACTION:DISPLAY\r\nTRIGGER:-P0DT0H30M0S\r\nDESCRIPTION:Event remainder\r\nEND:VALARM';
      var strVALARM = 'BEGIN:VALARM\r\nACTION:DISPLAY\r\nTRIGGER:-PT10M\r\nDESCRIPTION:Event remainder\r\nEND:VALARM';
      var opStrICS = '';

      for (var i = 0; i < arrStrICS.length; i += 1) {
        if (arrStrICS[i] === 'END:VEVENT') {
          opStrICS += strVALARM + '\r\n';
        }
        opStrICS += arrStrICS[i] + '\r\n';
      }

      //console.log(opStrICS);

      var fpICS = path.join('public', 'tmp', tNow + '.ics');
      fs.writeFile(fpICS, opStrICS, function (err) {
        if (err) throw err;

        res.send({ url: '/tmp/' + tNow + '.ics' });
        //res.sendfile(fpICS, function (sfErr) {
          //if (sfErr) throw sfErr;

          //console.log('Downloading...');
          ////fs.unlink(fpICS, function (fsDelErr) {
            ////if (fsDelErr) throw fsDelErr;

            ////console.log('Deleted');
          ////});
        //});

      });

    }
  });

  delete lstEvent;

  //var lstEvent = [
    //{ title: 'How Public Lab collaborates to make environmental science something anyone can do',
      //desc: 'Speaker: Liz Barry',
      //dtStart: '2014-04-11T09:30:00+08:00',
      //dtEnd: '2014-04-11T10:10:00+08:00',
      //location: 'ALL'
    //},
    //{ title: '快速佈署 Hadoop 環境',
      //desc: 'Speaker: 王耀聰',
      //dtStart: '2014-04-11T10:20:00+08:00',
      //dtEnd: '2014-04-11T10:50:00+08:00',
      //location: 'R0'
    //},
    //{ title: 'Sharding and Scale-out using MySQL Fabric',
      //desc: 'Speaker: 梶山 隆輔',
      //dtStart: '2014-04-11T11:50:00+08:00',
      //dtEnd: '2014-04-11T12:20:00+08:00',
      //location: 'R1'
    //},
    //{ title: '當黃色小鴨都可以進入基隆，Node.js 當然也可以娶 QML',
      //desc: 'Speaker: Fred Chien（錢逢祥）',
      //dtStart: '2014-04-12T10:20:00+08:00',
      //dtEnd: '2014-04-12T10:50:00+08:00',
      //location: 'R1'
    //}
    ////{ title: '',
      ////desc: '',
      ////dtStart: '',
      ////dtEnd: '',
      ////location: ''
    ////}
  //];
});

module.exports = router;
