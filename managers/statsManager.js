var stats = {
  level: 0,
  kills: 0,
  counter: 0,
  result: null,
  show: function (health, fire) {
    document.getElementById("health").innerHTML = health;
    document.getElementById("kills").innerHTML = this.kills;
    document.getElementById("attack").innerHTML = fire;
  },
};

function addRow(num, value, res, l) {
  let ref = document.getElementById("Table");
  let newRow = ref.insertRow(1);

  let numCell = newRow.insertCell(0);
  let numText = document.createTextNode(num);
  numCell.appendChild(numText);

  let levelCell = newRow.insertCell(1);
  let levelText = document.createTextNode(l);
  levelCell.appendChild(levelText);

  let valueCell = newRow.insertCell(2);
  let valueText = document.createTextNode(value);
  valueCell.appendChild(valueText);

  let resCell = newRow.insertCell(3);
  let resText = document.createTextNode(res ? "Won" : "Lost");
  resCell.appendChild(resText);
}

function again() {
  document.getElementById("overlay").style.display = "None";
  stats.result = null;
  stats.kills = 0;
  stats.counter++;
  gameManager.loadAll(ctx, stats.level);
  gameManager.play(ctx);
}

function another() {
  document.getElementById("overlay").style.display = "None";
  stats.result = null;
  stats.kills = 0;
  stats.counter++;
  stats.level ^= 1;
  gameManager.loadAll(ctx, stats.level);
  gameManager.play(ctx);
}
