var mapManager = {
  mapData: null, //переменная для хранения карты
  tLayer: null, // переменная для хранения ссылки на блоки карты
  xCount: 0, //количество блоков по горизонтали
  yCount: 0, //количество блоков по вертикали
  tSize: { x: 64, y: 64 }, // размер блока
  mapSize: { x: 32, y: 32 }, // размер карты в пикселях
  tilesets: [], //массив описаний блоков карты
  imgLoadCount: 0,
  imgLoaded: false,
  jsonLoaded: false,
  view: { x: 0, y: 0, w: 700, h: 700 },

  /*
    Здесь загружается карта, достается json и пихается в функцию
    parseMap
    ставится флаг jsonLoaded = false
  */
  loadMap: function (path) {
    this.jsonLoaded = false;
    let req = new XMLHttpRequest();

    req.onreadystatechange = function () {
      if (req.readyState === 4 && req.status === 200) {
        mapManager.parseMap(req.responseText);
      }
    };
    req.open("GET", path, true);
    req.send();
  },

  /*
    Парсится карта с переданного json-а
    флаг imgLoaded отвечает за загрузку всех блоков карты(песочек,водичка)

  */
  parseMap: function (tilesJSON) {
    this.mapData = JSON.parse(tilesJSON);

    this.xCount = this.mapData.width;
    this.yCount = this.mapData.height;

    this.tSize.x = this.mapData.tilewidth;
    this.tSize.y = this.mapData.tileheight;

    this.mapSize.x = this.xCount * this.tSize.x;
    this.mapSize.y = this.yCount * this.tSize.y;

    this.imgLoadCount = 0;
    this.imgLoaded = false;
    this.jsonLoaded = false;
    this.tLayer = this.mapData.layers.find(
      (layer) => layer.type === "tilelayer"
    );
    this.tilesets.length = 0;

    for (let i = 0; i < this.mapData.tilesets.length; i++) {
      let img = new Image();
      img.onload = function () {
        mapManager.imgLoadCount++;

        if (mapManager.imgLoadCount === mapManager.mapData.tilesets.length) {
          mapManager.imgLoaded = true; // загружены все блоки
        }
      };

      img.src = this.mapData.tilesets[i].image; // путь до картинки с блоком
      let t = this.mapData.tilesets[i];

      let ts = {
        firstgid: t.firstgid,
        image: img,
        name: t.name,
        xCount: Math.floor(t.imagewidth / mapManager.tSize.x),
        yCount: Math.floor(t.imageheight / mapManager.tSize.y),
      };
      this.tilesets.push(ts);
    }
    this.jsonLoaded = true;
  },

  /*
    Функция для отрисовки карты (песочка и водички)
  */
  draw: function (ctx) {
    if (!this.imgLoaded || !this.jsonLoaded) {
      setTimeout(() => this.draw(ctx), 100);
      return;
    } else {
      if (this.tLayer === null) {
        //ищем layer с блоками - это tLayer
        for (let id = 0; id < this.mapData.layers.length; id++) {
          let layer = this.mapData.layers[id];
          if (layer.type === "tilelayer") {
            this.tLayer = layer;
            break;
          }
        }
      }

      for (let i = 0; i < this.tLayer.data.length; i++) {
        //если в ячейке что-то есть
        if (this.tLayer.data[i] !== 0) {
          let tile = this.getTile(this.tLayer.data[i]);
          let pX = (i % this.xCount) * this.tSize.x;
          let pY = Math.floor(i / this.xCount) * this.tSize.y;

          if (!this.isVisible(pX, pY, this.tSize.x, this.tSize.y)) {
            continue;
          }
          pX -= this.view.x;
          pY -= this.view.y;

          ctx.drawImage(
            tile.img,
            tile.px,
            tile.py,
            this.tSize.x,
            this.tSize.y,
            pX,
            pY,
            this.tSize.x,
            this.tSize.y
          );
        }
      }
    }
  },

  //Получаем тайл по его индексу
  getTile: function (tileIndex) {
    let tile = {
      img: null,
      px: 0,
      py: 0,
    };
    let tileset = this.getTileset(tileIndex);
    tile.img = tileset.image;
    let id = tileIndex - tileset.firstgid;
    let x = id % tileset.xCount;
    let y = Math.floor(id / tileset.xCount);
    tile.px = x * mapManager.tSize.x;
    tile.py = y * mapManager.tSize.y;
    return tile;
  },

  //Получаем по индексу тайл из массива тайлов
  getTileset(tileIndex) {
    for (let i = mapManager.tilesets.length - 1; i >= 0; i--) {
      if (mapManager.tilesets[i].firstgid <= tileIndex) {
        return mapManager.tilesets[i];
      }
    }
    return null;
  },

  //Виден ли блок в окне
  isVisible: function (x, y, width, height) {
    if (
      x + width < this.view.x ||
      y + height < this.view.y ||
      x > this.view.x + this.view.w ||
      y > this.view.y + this.view.h
    ) {
      return false;
    }
    return true;
  },

  //Парсинг объектов (игрок, злодеи, бонусы)
  parseEntities: function () {
    if (!mapManager.imgLoaded || !mapManager.jsonLoaded) {
      setTimeout(() => mapManager.parseEntities(), 100);
    } else {
      for (let j = 0; j < this.mapData.layers.length; j++) {
        if (this.mapData.layers[j].type === "objectgroup") {
          let entities = this.mapData.layers[j];
          for (let i = 0; i < entities.objects.length; i++) {
            let e = entities.objects[i];
            try {
              let obj = Object.create(gameManager.factory[e.type]);
              obj.name = e.name;
              obj.pos_x = e.x;
              obj.pos_y = e.y;
              obj.size_x = e.width;
              obj.size_y = e.height;
              if (e.props) {
                for (let i = 0; i < e.props.length; i++) {
                  obj[e.props[i].name] = e.props[i].value;
                }
              }
              obj.type = e.type;

              gameManager.entities.push(obj);
              if (obj.name === "Player") {
                gameManager.initPlayer(obj);
              }
            } catch (ex) {
              console.log(
                "Error while creating: [" + e.gid + "] " + e.type + ", " + ex
              );
            }
          }
        }
      }
    }
  },

  // блок по координатам на карте
  getTilesetIdx: function (x, y) {
    let wX = x;
    let wY = y;
    let idx =
      Math.floor(wY / this.tSize.y) * this.xCount +
      Math.floor(wX / this.tSize.x);
    return this.tLayer.data[idx];
  },

  //центрирование области mapManager.view относительно положения игрока (x,y)
  centerAt: function (x, y) {
    if (x < this.view.w / 2) {
      this.view.x = 0;
    } else if (x > this.mapSize.x - this.view.w / 2) {
      this.view.x = this.mapSize.x - this.view.w;
    } else {
      this.view.x = x - this.view.w / 2;
    }
    if (y < this.view.h / 2) {
      this.view.y = 0;
    } else if (y > this.mapSize.y - this.view.h / 2) {
      this.view.y = this.mapSize.y - this.view.h;
    } else {
      this.view.y = y - this.view.h / 2;
    }
  },
};
