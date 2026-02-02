function setup() {
  createCanvas(400, 400);
}

function draw() {
  background(225);
  
  fill(100);
  ellipse(mouseX, mouseY, 18, 18);
  
  let buttonSize = 30;
  let spacing = 50;
  let startX = 35;
  let buttonY = 370;
  
  let colors = [
    [255, 0, 0],
    [175, 100, 220],
    [0, 126, 255, 102],
    [0, 255, 0],     
    [0, 0, 255],     
    [255, 255, 0],  
    [0, 50, 100],   
    [0, 255, 255],
    [0, 50, 100]
  ];
  
  for (let i = 0; i < 7; i++) {
    fill(colors[i]);
    ellipse(startX + (i * spacing), buttonY, buttonSize,       buttonSize);
  }
}