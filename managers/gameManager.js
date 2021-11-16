var maps = ["map1.json", "map2.json"];

//мен еджер
var gameManager = {
  factory: {}, //фабрика объектов на карте, используется в parseEnTiTies
  entities: [], //объекты на каарте
  fireNum: 0, //идентификатор выстрела
  player: null, //указатель на объект игрока
  laterKill: [], //отложенное уничтожение объекта
  drawInterval: 20, //
  intervalId: null,

  //инициализация игрока
  initPlayer: function (obj) {
    this.player = obj;
  },
  //убивство объекта  obj
  kill: function (obj) {
    this.laterKill.push(obj);
  },
  //обновление
  update: function (ctx) {
    if (!this.player) {
      return;
    }
    //по умолчанию игрок никуда не двигается
    this.player.move_x = 0;
    this.player.move_y = 0;

    if (eventsManager.action["up"]) {
      this.player.move_y = -1;
    }
    if (eventsManager.action["down"]) {
      this.player.move_y = 1;
    }
    if (eventsManager.action["left"]) {
      this.player.move_x = -1;
    }
    if (eventsManager.action["right"]) {
      this.player.move_x = 1;
    }

    if (eventsManager.action["fire"]) {
      this.player.fire();
    }

    this.entities.forEach(function (e) {
      try {
        e.update();
      } catch (ex) {
        console.log(ex);
      }
    });

    for (let i = 0; i < this.laterKill.length; i++) {
      let idx = this.entities.indexOf(this.laterKill[i]);
      if (idx > -1) {
        if (this.entities[idx].type === "Enemy") {
          stats.kills++;
        }
        this.entities.splice(idx, 1);
      }
      if (this.laterKill[i].name === "Player") {
        stats.result = false;
        gameManager.stop();
      }
    }

    if (this.laterKill.length > 0) {
      this.laterKill.length = 0;
    }

    let enemyCounter = 0;
    for (let i = 0; i < this.entities.length; i++) {
      if (this.entities[i].type === "Enemy") {
        enemyCounter++;
      }
    }
    if (enemyCounter === 0) {
      stats.result = true;
      gameManager.stop();
    }

    ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);

    mapManager.draw(ctx);
    mapManager.centerAt(this.player.pos_x, this.player.pos_y);
    this.draw(ctx);
    stats.show(this.player.lifetime, this.player.fireballDamage);
  },

  //отрисовка всех объеектов которые еще не умерли
  draw: function (ctx) {
    for (let index = 0; index < this.entities.length; index++)
      this.entities[index].draw(ctx);
  },

  //загрузка всего
  loadAll: function (ctx) {
    this.laterKill.length = 0;
    this.entities.length = 0;
    this.player = null;
    this.fireNum = 0;

    //загрузка карты
    mapManager.loadMap(maps[stats.level]);
    //загрузка атласа
    spriteManager.loadAtlas("objects.json", "objects.png");
    //fabric initialization
    this.factory["Player"] = Player;
    this.factory["Enemy"] = Enemy;
    this.factory["Health"] = Health;
    this.factory["Candle"] = Candle;
    this.factory["Fireball"] = Fireball;

    //разбор сущностей карты
    mapManager.parseEntities();
    //отображение карты
    mapManager.draw(ctx);
    //настройка событий
    eventsManager.setup(ctx.canvas);
  },

  //играть
  play: function (ctx) {
    gameManager.stop();
    gameManager.intervalId = setInterval(
      () => updateWorld(ctx),
      gameManager.drawInterval
    );
  },

  //заканчивать играть
  stop: function () {
    if (gameManager.intervalId) {
      clearInterval(gameManager.intervalId);
      gameManager.intervalId = null;
    }
    if (stats.result !== null) {
      stats.result = null;
      stats.kills = 0;
      stats.counter++;
      stats.level ^= 1;
      gameManager.loadAll(ctx);
      gameManager.play(ctx);
    }
  },
};

function updateWorld(ctx) {
  gameManager.update(ctx);
}
