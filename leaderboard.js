// Set up a collection to contain player information. On the server,
// it is backed by a MongoDB collection named "players."

Players = new Meteor.Collection("players");

function randomizeScores() {
  Players.find().forEach(function(player) {
      Players.update(player, {$set: {score: Math.floor(Math.random()*10)*5}});
    });  
    Session.set("sort", "score");
}

if (Meteor.is_client) {
  Template.leaderboard.players = function () {
    var sort = Session.equals('sort', 'name') ? {name:1} : {score:-1};
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
    },
    'click button.score': function () {
      Session.set("sort", "score");
    },
    'click button.randomize': function () {
      randomizeScores();
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
      Session.set('sort', 'score');
    }
  });
}