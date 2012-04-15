// Set up a collection to contain player information. On the server,
// it is backed by a MongoDB collection named "players."

Players = new Meteor.Collection("players");

function randomScore() {
  return Math.floor(Math.random()*10)*5;
}

/* 
  helper function to randomize player scores
*/
function randomizeScores() {
  Players.find().forEach(function(player) {
      Players.update(player, {$set: {score: randomScore()}});
    });  
    Session.set("sort", "score");
}

// process client and template requests
if (Meteor.is_client) {
  Template.leaderboard.players = function () {
    // evaluate sorting order reversing it as necessary
    var order = Session.get("order");
    if(!order) {
      order = 1;
      Session.set('order', order);
    }
    // determine the sorting
    var sort = Session.equals('sort', 'name') ? {name:order} : {score:order};
    return Players.find({}, {sort: sort});
  };

  Template.leaderboard.selected_name = function () {
    var player = Players.findOne(Session.get("selected_player"));
    return player && player.name;
  };

  Template.player.selected = function () {
    return Session.equals("selected_player", this._id) ? "selected" : '';
  };

  Template.leaderboard.events = {
    'click input.inc': function () {
      Players.update(Session.get("selected_player"), {$inc: {score: 5}});
    },
    'click input.dec': function () {
      Players.update(Session.get("selected_player"), {$inc: {score: -5}});
    }
  };

  Template.player.events = {
    'click': function () {
      Session.set("selected_player", this._id);
    }
  };

  Template.controls.events = {
    'click button.name': function () {
      Session.set("sort", "name");
      Session.set("order", Session.get("order") * -1);
    },
    'click button.score': function () {
      Session.set("sort", "score");
      Session.set("order", Session.get("order") * -1);
    },
    'click button.randomize': function () {
      randomizeScores();
    },
    'click button.create': function () {
      var name = $('#pname').val();      
      var score = randomScore();
      Players.insert({name: name, score: score});
    }
  };
}

// On server startup, create some players if the database is empty.
if (Meteor.is_server) {
  Meteor.startup(function () {
    if (Players.find().count() === 0) {
      var names = ["Marie Curie",
                   "Grace Hopper",
                   "Ada Lovelace",
                   "Nicola Tesla",
                   "Carl Friedrich Gauss",
                   "Claude Shannon"];
      randomizeScores();
    }
    Session.set('sort', 'score');
    Session.set("order", 1);
  });
}