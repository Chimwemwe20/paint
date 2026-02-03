let currentColor;
let brushSize = 6;
let erasing = false;

let colors = [
  { c: [255, 0, 0], label: "RED" },
  { c: [0, 0, 255], label: "BLUE" },
  { c: [0, 255, 0], label: "GREEN" },
  { c: [0, 0, 0], label: "BLACK" }
];

let sizes = [
  { size: 4, label: "S" },
  { size: 8, label: "M" },
  { size: 14, label: "L" }
];

function setup() {
  createCanvas(400, 400);
  background(225);
  currentColor = color(0);
  textSize(10);
  textAlign(CENTER, CENTER);
}

function draw() {
  if (mouseIsPressed && mouseY < 350) {
    strokeWeight(brushSize);
    stroke(erasing ? 225 : currentColor);
    line(pmouseX, pmouseY, mouseX, mouseY);
  }

  drawUI();
}

function drawUI() {
  noStroke();

  // Color buttons
  for (let i = 0; i < colors.length; i++) {
    fill(colors[i].c);
    rect(10 + i * 40, 360, 30, 30);
    fill(0);
    text(colors[i].label, 25 + i * 40, 355);
  }

  // Brush size buttons
  for (let i = 0; i < sizes.length; i++) {
    fill(180);
    rect(180 + i * 40, 360, 30, 30);
    fill(0);
    text(sizes[i].label, 195 + i * 40, 375);
  }
  text("SIZE", 235, 355);

  // Eraser
  fill(255);
  rect(310, 360, 30, 30);
  fill(0);
  text("ERASE", 325, 375);

  // Clear
  fill(200);
  rect(350, 360, 40, 30);
  fill(0);
  text("CLEAR", 370, 375);
}

function mousePressed() {
  if (mouseY > 360 && mouseY < 390) {

    // Colors
    for (let i = 0; i < colors.length; i++) {
      let x = 10 + i * 40;
      if (mouseX > x && mouseX < x + 30) {
        currentColor = color(...colors[i].c);
        erasing = false;
      }
    }

    // Sizes
    for (let i = 0; i < sizes.length; i++) {
      let x = 180 + i * 40;
      if (mouseX > x && mouseX < x + 30) {
        brushSize = sizes[i].size;
      }
    }

    // Eraser
    if (mouseX > 310 && mouseX < 340) {
      erasing = true;
    }

    // Clear
    if (mouseX > 350 && mouseX < 390) {
      background(225);
    }
  }
}
