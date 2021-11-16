var eventsManager = {
  bind: {},
  action: {},
  mouse: { x: 0, y: 0 },
  setup: function (canvas) {
    this.bind[87] = "up";
    this.bind[65] = "left";
    this.bind[83] = "down";
    this.bind[68] = "right";
    this.bind[32] = "fire";
    canvas.addEventListener("mousedown", this.onMouseDown);
    canvas.addEventListener("mouseup", this.onMouseUp);
    canvas.addEventListener("mousemove", this.onMouseMove);
    document.body.addEventListener("keydown", this.onKeyDown);
    document.body.addEventListener("keyup", this.onKeyUp);
  },
  onMouseDown: function (event) {
    eventsManager.action["fire"] = true;
  },
  onMouseUp: function (event) {
    eventsManager.action["fire"] = false;
  },
  onKeyDown: function (event) {
    let action = eventsManager.bind[event.keyCode];

    if (action) {
      eventsManager.action[action] = true;
    }
  },
  onKeyUp: function (event) {
    let action = eventsManager.bind[event.keyCode];

    if (action) {
      eventsManager.action[action] = false;
    }
  },
  onMouseMove: function (event) {
    eventsManager.mouse = {
      x: event.clientX,
      y: event.clientY,
    };
  },
};
