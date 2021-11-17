//Класс объектов
var Entity = {
  pos_x: 0,
  pos_y: 0,
  size_x: 0,
  size_y: 0,
  extend: function (extendProto) {
    let object = Object.create(this);
    for (let property in extendProto) {
      if (
        this.hasOwnProperty(property) ||
        typeof object[property] === "undefined"
      ) {
        object[property] = extendProto[property];
      }
    }
    return object;
  },
};

//Класс игрока
var Player = Entity.extend({
  lifetime: 600,
  move_x: 0,
  move_y: 1,
  speed: 3,
  size_x: 50,
  size_y: 50,
  rotation: 90,
  firegap: 0,
  fireballDamage: 50,
  //Функция отрисовки объекта
  draw: function (ctx) {
    spriteManager.drawSprite(
      ctx,
      "hero",
      this.pos_x,
      this.pos_y,
      this.rotation,
      this.size_x,
      this.size_y
    );
  },
  //Функция обновления объекта
  update: function () {
    if (this.firegap > 0) {
      this.firegap--;
    }
    this.move_y = 0;
    this.move_x = 0;

    if (eventsManager.action["down"]) {
      this.move_y = 1;
      this.rotation = 90;
    } else if (eventsManager.action["up"]) {
      this.move_y = -1;
      this.rotation = -90;
    } else if (eventsManager.action["left"]) {
      this.move_x = -1;
      this.rotation = -180;
    } else if (eventsManager.action["right"]) {
      this.move_x = 1;
      this.rotation = 0;
    }

    physicManager.update(this);
  },
  //Функция срабатывющая при касании другого объекта obj(бонусы)
  onTouchEntity: function (obj) {
    if (obj.type === "Health") {
      obj.kill();
      this.lifetime += 50;
    } else if (obj.type === "Candle") {
      obj.kill();
      this.fireballDamage += 50;
    }
    stats.show(this.lifetime, this.fireballDamage);
  },
  //Функция смерти
  kill: function () {
    gameManager.laterKill.push(this);
  },
  //Функция атаки
  fire: function () {
    if (this.firegap > 0) {
      return;
    }

    let r = Object.create(Fireball);
    r.name = "fireball" + ++gameManager.fireNum;
    r.owner = this;
    r.damage = this.fireballDamage;

    switch (this.rotation) {
      case -180: {
        // left
        r.pos_x = this.pos_x - r.size_x - 10;
        r.pos_y = this.pos_y + this.size_y / 2 - r.size_y / 2;
        r.move_x = -1;
        break;
      }
      case 0: {
        // right
        r.pos_x = this.pos_x + this.size_x + 10;
        r.pos_y = this.pos_y + this.size_y / 2 - r.size_y / 2;
        r.move_x = 1;
        break;
      }
      case -90: {
        // top
        r.pos_x = this.pos_x + this.size_x / 2 - r.size_x / 2;
        r.pos_y = this.pos_y - r.size_y - 10;
        r.move_y = -1;
        break;
      }
      case 90: {
        // bottom
        r.pos_x = this.pos_x + this.size_x / 2 - r.size_x / 2;
        r.pos_y = this.pos_y + this.size_y + 10;
        r.move_y = 1;
      }
    }
    gameManager.entities.push(r);
    this.firegap = 10;
  },

  //Функция получения урона
  damage: function (damage) {
    this.lifetime -= damage;
    if (this.lifetime <= 0) {
      this.lifetime = 0;
      this.kill();
    }
    stats.show(this.lifetime, this.fireballDamage);
  },
});

var Enemy = Entity.extend({
  lifetime: 100,
  move_x: 0,
  move_y: 0,
  speed: 1,
  size_x: 50,
  size_y: 60,
  rotation: 0,
  //Отрисовка объекта
  draw: function (ctx) {
    spriteManager.drawSprite(
      ctx,
      "enemy",
      this.pos_x,
      this.pos_y,
      this.rotation,
      this.size_x,
      this.size_y
    );
  },
  // Обновление объекта
  update: function () {
    if (this.firegap > 0) {
      this.firegap--;
    }

    let player = gameManager.player;

    if (
      Math.abs(this.pos_x - player.pos_x) <= 10 &&
      Math.abs(this.pos_y - player.pos_y) <= 100
    ) {
      this.rotation = this.pos_y > player.pos_y ? 180 : 0;
      this.fire();
    } else if (
      Math.abs(this.pos_y - player.pos_y) <= 10 &&
      Math.abs(this.pos_x - player.pos_x) <= 300
    ) {
      this.rotation = this.pos_x > player.pos_x ? 90 : -90;
      this.fire();
    } else {
      if (this.move_y) {
        this.rotation = this.move_y === 1 ? 0 : 180;
      } else if (this.move_x) {
        this.rotation = this.move_x === 1 ? -90 : 90;
      }
      physicManager.update(this);
    }
  },
  //Касание объекта
  onTouchEntity: function (obj) {
    this.move_x = -this.move_x;
    this.move_y = -this.move_y;
  },
  //Касание блоков карты
  onTouchMap: function () {
    this.move_x = -this.move_x;
    this.move_y = -this.move_y;
  },
  //Функция смерти
  kill: function () {
    gameManager.laterKill.push(this);
  },
  //Функция атаки
  fire: function () {
    if (this.firegap > 0) {
      return;
    }

    let r = Object.create(Fireball);
    r.name = "fireball" + ++gameManager.fireNum;
    r.owner = this;
    r.speed = 5;

    switch (this.rotation) {
      case 90: {
        // left
        r.pos_x = this.pos_x - r.size_x - 10;
        r.pos_y = this.pos_y + this.size_y / 2 - r.size_y / 2;
        r.move_x = -1;
        break;
      }
      case -90: {
        // right
        r.pos_x = this.pos_x + this.size_x + 10;
        r.pos_y = this.pos_y + this.size_y / 2 - r.size_y / 2;
        r.move_x = 1;
        break;
      }
      case 180: {
        // top
        r.pos_x = this.pos_x + this.size_x / 2 - r.size_x / 2;
        r.pos_y = this.pos_y - r.size_y - 10;
        r.move_y = -1;
        break;
      }
      case 0: {
        // bottom
        r.pos_x = this.pos_x + this.size_x / 2 - r.size_x / 2;
        r.pos_y = this.pos_y + this.size_y + 10;
        r.move_y = 1;
      }
    }
    gameManager.entities.push(r);
    this.firegap = 50;
  },
  //Функция получения урона
  damage: function (damage) {
    this.lifetime -= damage;
    if (this.lifetime <= 0) this.kill();
  },
});

var Fireball = Entity.extend({
  damage: 50,
  owner: null,
  move_x: 0,
  move_y: 0,
  speed: 7,
  size_x: 8,
  size_y: 8,
  //Отрисовка файрболла
  draw: function (ctx) {
    spriteManager.drawSprite(
      ctx,
      "fireball",
      this.pos_x,
      this.pos_y,
      0,
      this.size_x,
      this.size_y
    );
  },
  //Обновление файеерболла
  update: function () {
    physicManager.update(this);
  },
  //Соприкосновение с объектом
  onTouchEntity: function (obj) {
    this.kill();

    if (typeof obj.damage === "function") obj.damage(this.damage);
  },
  //Соприкосновение с картой
  onTouchMap: function () {
    this.kill();
  },
  //угасание файерболла
  kill: function () {
    gameManager.laterKill.push(this);
  },
});

//Класс объекта хилки
var Health = Entity.extend({
  size_x: 40,
  size_y: 35,
  //отрисовка хилки
  draw: function (ctx) {
    spriteManager.drawSprite(ctx, "health", this.pos_x, this.pos_y);
  },
  //исчезновение хилки
  kill: function () {
    gameManager.laterKill.push(this);
  },
  update: function () {},
});

//Класс объекта восполнения зарядов файерболлов
var Candle = Entity.extend({
  size_x: 20,
  size_y: 37,
  //отрисовка восполнителя
  draw: function (ctx) {
    spriteManager.drawSprite(ctx, "candle", this.pos_x, this.pos_y);
  },
  //убивание восполнителя
  kill: function () {
    gameManager.laterKill.push(this);
  },
  update: function () {},
});
