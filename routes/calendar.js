var express = require('express')
var app = express()

app.get('/', function(req, res, next) {
  req.getConnection(function(error, conn) {
    conn.query('SELECT * FROM event ORDER BY Date',function(err, rows, fields) {
        res.render('calendar/calendar', {
          title: 'Google Calendar API Quickstart', 
          data: rows
        })
      })
  })
})

app.post('/', function(req, res, next) {
  console.log("Poooooost");
  search_text = req.body.searchText;
  // 要新增的 Data
  event_content = req.body.event_content
  event_time = req.body.event_content_time
  event_id = req.body.event_id
  // sql 已有Data
  sql_date = req.body.sql_date
  sql_event = req.body.sql_event
  sql_event_id = req.body.sql_event_id

  console.log(event_content)
  event_content = event_content.split(",");
  event_time = event_time.split(",");
  event_id = event_id.split(",");

  // 檢查sql 是不是空的
  if (typeof sql_event === "undefined") {
    console.log("SQL Empty")
    sql_event_id=["Empty"]
  }

  for (i=0; i< sql_event_id.length; i++){
    if (sql_event_id.includes(event_id[i]+"</td")){
      delete event_content[i]
      delete event_time[i]
      delete event_id[i]
    }
    else{
      continue;
    }
  }
  // 刪掉空值
  var event_content = event_content.filter(el => el);
  var event_time = event_time.filter(el => el);
  var event_id = event_id.filter(el => el);

  console.log("刪除完剩下",event_content,event_time,event_id)

  req.getConnection(function(error, conn) {
    for (i=0; i< event_content.length; i++) {
      event_time[i] = event_time[i].replace('+08:00','')
      var content = {
        Date: event_time[i],
        Event: event_content[i],
        Event_id: event_id[i],
      }
      conn.query('INSERT INTO event SET ? ', content, function(err, result) {
        if (err) {
          console.log("err")
          throw err
        }
        else {
          req.flash('success', 'Data added successfully!')
        }
      })
    }
    res.redirect('/calendar')
  })
})

//Event 頁面
app.get('/event', function(req, res, next) {
  req.getConnection(function(error, conn) {
    conn.query('SELECT * FROM event ORDER BY Date',function(err, rows, fields) {
        res.render('calendar/event', {
          title: 'Event', 
          data: rows
        })
    })
  })
})

// DELETE Event
app.get('/delete', function (req, res, next) {
  console.log('delete id')
  var id = req.query.id;
  req.getConnection(function(error, conn) {
    conn.query('DELETE FROM event WHERE id = ?', id, function (err, rows) {
    if (err) {
      console.log(err);
    }
    res.redirect('/calendar/event');
    });
  });

})

//Edit Calendar
app.get('/edit', function (req, res, next) {
  var id = req.query.id;
  console.log('Edit id',id)

  req.getConnection(function(error, conn) {
    conn.query('SELECT * FROM event WHERE id = ?', id, function (err, rows) {
    if (err) {
      console.log(err);
    }
    var data = rows;
    res.render('calendar/edit', { title: 'Edit event', data: data });
    });
  });

})

app.post('/edit', function (req, res, next) {
  var id = req.body.id;

  var sql = {
    date:req.body.start_date,
    // end_time: req.body.end_time,
    event: req.body.event_name
  };
  req.getConnection(function(error, conn){
    conn.query('UPDATE event SET ? WHERE id = ?',[sql,id], function (err, rows) {
    if (err) {
      console.log(err);
    }
    res.setHeader('Content-Type', 'application/json');
    res.redirect('/calendar/event');
    });
  });
});

// Search 
app.post('/Search', function (req, res, next) {
  console.log('search')
  searchText = req.body.searchText;
  req.getConnection(function(error, conn) {
    conn.query('Select * FROM event WHERE Event like  ?', searchText, function (err, rows) {
    if (err) {
      console.log(err);
    }
    res.render('calendar/event', {
      title: 'Event', 
      data: rows
    })
    });
  });

})


module.exports= app;