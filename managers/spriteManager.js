var spriteManager = {
  image: new Image(), //рисунок объектов
  sprites: new Array(), //массив объектов для отображения
  imgLoaded: false, //изображения загружены
  jsonLoaded: false, //json загружен
  //загрузка картинки(атласа) с объектами
  loadAtlas: function (atlasJson, atlasImg) {
    var req = new XMLHttpRequest();
    this.imgLoaded = false;
    this.jsonLoaded = false;

    req.onreadystatechange = function () {
      if (req.readyState === 4 && req.status === 200) {
        spriteManager.parseAtlas(req.responseText);
      }
    };

    req.open("GET", atlasJson, true);
    req.send();
    this.loadImg(atlasImg);
  },
  //сохранение путя до картинки
  loadImg: function (imgName) {
    this.image.onload = function () {
      spriteManager.imgLoaded = true;
    };
    this.image.src = imgName;
  },
  //парсинг атласа из json-object
  //сохранение объектов-спрайтов в массив sprites
  parseAtlas: function (atlasJSON) {
    let atlas = JSON.parse(atlasJSON);
    for (let i = 0; i < atlas.length; i++) {
      let frame = atlas[i];
      this.sprites.push({
        name: frame.name,
        x: frame.x,
        y: frame.y,
        w: frame.w,
        h: frame.h,
      });
    }
    this.jsonLoaded = true;
  },

  /*
    отрисовка спрайта 
  */
  drawSprite: function (
    ctx,
    name,
    x,
    y,
    rotation = 0,
    width = null,
    height = null
  ) {
    if (!this.imgLoaded || !this.jsonLoaded) {
      setTimeout(() => {
        spriteManager.drawSprite(ctx, name, x, y);
      }, 100);
    } else {
      let sprite = this.getSprite(name);

      if (!sprite) {
        console.log(`Spritee ${name} was not found!!!`);
        return;
      }

      if (!width) {
        width = sprite.w;
      }

      if (!height) {
        height = sprite.h;
      }

      if (!mapManager.isVisible(x, y, sprite.w, sprite.h)) {
        return;
      }

      x -= mapManager.view.x;
      y -= mapManager.view.y;

      rotation = (rotation * Math.PI) / 180;

      ctx.save();
      ctx.translate(x + width / 2, y + height / 2);
      ctx.rotate(rotation);

      //картинка вырезается из атласа и вставляется на канквас
      ctx.drawImage(
        this.image,
        sprite.x,
        sprite.y,
        sprite.w,
        sprite.h,
        -width / 2,
        -height / 2,
        width,
        height
      );

      ctx.restore();
    }
  },
  //получение спрайта из массива спрайтов по его имени
  getSprite: function (name) {
    for (let i = 0; i < this.sprites.length; i++) {
      let s = this.sprites[i];
      if (s.name === name) {
        return s;
      }
    }
    return null;
  },
};
