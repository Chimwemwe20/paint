// ============================================================================
// MAIN CODE - TOOLS
// ============================================================================

class BaseTool {
  constructor(name) { this.name = name; }
  apply(x1, y1, x2, y2, settings, bgColor) {
    throw new Error("apply() must be implemented by subclass");
  }
  getName() { return this.name; }
}

class BrushTool extends BaseTool {
  constructor() { super("Brush"); }
  apply(x1, y1, x2, y2, settings, bgColor) {
    strokeWeight(settings.brushSize);
    stroke(settings.currentColor);
    line(x1, y1, x2, y2);
  }
}

class EraserTool extends BrushTool {
  constructor() {
    super();
    this.name = "Eraser";
  }
  apply(x1, y1, x2, y2, settings, bgColor) {
    strokeWeight(settings.brushSize);
    stroke(bgColor);
    line(x1, y1, x2, y2);
  }
}

// ============================================================================
// MAIN CODE - UI CONTROLS
// ============================================================================

class Button {
  constructor(x, y, w, h, label) {
    this.x = x; this.y = y; this.w = w; this.h = h;
    this.label = label;
    this.isActive = false;
    this.group = null;
  }
  
  contains(mx, my) {
    return mx >= this.x && mx <= this.x + this.w &&
           my >= this.y && my <= this.y + this.h;
  }
  
  execute(app) {}
  
  display() {
    fill(this.isActive ? 100 : 180);
    rect(this.x, this.y, this.w, this.h);
    fill(0);
    textAlign(CENTER, CENTER);
    text(this.label, this.x + this.w / 2, this.y + this.h / 2);
  }
}

class ColorButton extends Button {
  constructor(x, y, w, h, colorArray, label) {
    super(x, y, w, h, label);
    this.colorArray = colorArray;
    this.group = 'color';
  }
  
  execute(app) { app.setColor(this.getColor()); }
  
  display() {
    fill(this.colorArray);
    rect(this.x, this.y, this.w, this.h);
    if (this.isActive) {
      noFill(); stroke(0); strokeWeight(3);
      rect(this.x, this.y, this.w, this.h);
      noStroke();
    }
    fill(0); textAlign(CENTER, CENTER);
    text(this.label, this.x + this.w / 2, this.y - 8);
  }
  
  getColor() { return color(...this.colorArray); }
}

class ToolButton extends Button {
  constructor(x, y, w, h, tool, label) {
    super(x, y, w, h, label);
    this.tool = tool;
    this.group = 'tool';
  }
  execute(app) { app.setTool(this.tool); }
}

class ClearButton extends Button {
  constructor(x, y, w, h, label){
    super(x, y, w, h, label);
  }
  execute(app) {
    app.clearCanvas();
  }
}

class Slider {
  constructor(x, y, w, h, minVal, maxVal, defaultVal, label) {
    this.x = x; this.y = y; this.w = w; this.h = h;
    this.minVal = minVal; this.maxVal = maxVal;
    this.value = defaultVal; this.label = label;
    this.isDragging = false;
  }
  
  contains(mx, my) {
    return mx >= this.x && mx <= this.x + this.w &&
           my >= this.y && my <= this.y + this.h;
  }
  
  startDrag() { this.isDragging = true; }
  stopDrag() { this.isDragging = false; }
  
  updateValue(mx) {
    if (this.isDragging) {
      let pos = (mx - this.x) / this.w;
      pos = Math.max(0, Math.min(1, pos));
      this.value = Math.round(this.minVal + pos * (this.maxVal - this.minVal));
    }
  }
  
  getValue() { return this.value; }
  
  setValue(val) {
    this.value = Math.max(this.minVal, Math.min(this.maxVal, val));
  }
  
  display() {
    fill(180);
    rect(this.x, this.y, this.w, this.h);
    let handlePos = map(this.value, this.minVal, this.maxVal, this.x, this.x + this.w);
    fill(this.isDragging ? 100 : 120);
    rect(handlePos - 5, this.y - 5, 10, this.h + 10);
    fill(0); textAlign(LEFT, CENTER);
    text(this.label, this.x, this.y - 12);
    textAlign(RIGHT, CENTER);
    text(this.value, this.x + this.w, this.y - 12);
  }
}

// ============================================================================
// MAIN CODE - SETTINGS
// ============================================================================

class ToolSettings {
  constructor() {
    this.currentColor = null;
    this._brushSize = 8;
    this.MIN_SIZE = 1;
    this.MAX_SIZE = 50;
  }
  
  get brushSize() { return this._brushSize; }
  
  set brushSize(size) {
    this._brushSize = Math.max(this.MIN_SIZE, Math.min(this.MAX_SIZE, size));
  }
  
  setColor(c) { this.currentColor = c; }
  isValidSize(size) { return size >= this.MIN_SIZE && size <= this.MAX_SIZE; }
}

// ============================================================================
// MAIN CODE - PAINT APP
// ============================================================================

class PaintApp {
  constructor(canvasWidth, canvasHeight, bgColor) {
    this.canvasWidth = canvasWidth;
    this.canvasHeight = canvasHeight;
    this.bgColor = bgColor;
    this.uiZoneTop = 340;
    this.settings = new ToolSettings();
    this.tools = { brush: new BrushTool(), eraser: new EraserTool() };
    this.currentTool = this.tools.brush;
    this.buttons = [];
    this.slider = null;
    this.setupUI();
  }
  
  clearCanvas() {
    background(this.bgColor);
  }
  
  setupUI() {
    const colors = [
      { c: [255, 0, 0], label: "RED" },
      { c: [0, 0, 255], label: "BLUE" },
      { c: [0, 255, 0], label: "GREEN" },
      { c: [0, 0, 0], label: "BLACK" }
    ];
    
    colors.forEach((data, i) => {
      const btn = new ColorButton(10 + i * 40, 360, 30, 30, data.c, data.label);
      if (i === 3) btn.isActive = true;
      this.buttons.push(btn);
    });
    
    this.slider = new Slider(180, 365, 140, 10, 1, 50, 8, "Size:");
    
    const brushBtn = new ToolButton(330, 360, 40, 30, this.tools.brush, "BRUSH");
    brushBtn.isActive = true;
    this.buttons.push(brushBtn);
    
    const eraserBtn = new ToolButton(375, 360, 40, 30, this.tools.eraser, "ERASE");
    this.buttons.push(eraserBtn);
    
    const clearBtn = new ClearButton(420, 360, 40, 30, "CLEAR");
    this.buttons.push(clearBtn);
    
  }
  
  handleClick(mx, my) {
    if (this.slider.contains(mx, my)) {
      this.slider.startDrag();
      this.slider.updateValue(mx);
      this.settings.brushSize = this.slider.getValue();
      return;
    }
    for (let btn of this.buttons) {
      if (btn.contains(mx, my)) {
        btn.execute(this);
        if (btn.group) this.setActiveInGroup(btn);
        break;
      }
    }
  }
  
  handleDrag(mx, my) {
    if (this.slider.isDragging) {
      this.slider.updateValue(mx);
      this.settings.brushSize = this.slider.getValue();
    }
  }
  
  handleRelease() { this.slider.stopDrag(); }
  
  isInDrawingArea(x, y) { return y < this.uiZoneTop; }
  
  setActiveInGroup(activeBtn) {
    this.buttons.forEach(btn => {
      if (btn.group === activeBtn.group) {
        btn.isActive = (btn === activeBtn);
      }
    });
  }
  
  setColor(c) { this.settings.setColor(c); }
  setTool(tool) { this.currentTool = tool; }
  
  drawStroke(x1, y1, x2, y2) {
    if (this.isInDrawingArea(x1, y1) && this.isInDrawingArea(x2, y2)) {
      this.currentTool.apply(x1, y1, x2, y2, this.settings, this.bgColor);
    }
  }
  
  displayUI() {
    noStroke();
    fill(210);
    rect(0, this.uiZoneTop, this.canvasWidth, this.canvasHeight - this.uiZoneTop);
    this.buttons.forEach(btn => btn.display());
    this.slider.display();    
    fill(225); 
    rect(0, 0, 250, 25);
    fill(0); 
    textAlign(LEFT, CENTER);
    text(`Tool: ${this.getCurrentToolName()} | Size: ${this.settings.brushSize}`, 10, 15);
  }
  
  getCurrentToolName() { return this.currentTool.getName(); }
}

// ============================================================================
// MAIN CODE - P5.JS INTERFACE
// ============================================================================

let app;

function setup() {
  createCanvas(600, 600);
  background(225);
  app = new PaintApp(600, 600, 225);
  app.settings.currentColor = color(0);
  textSize(10);
  runTests();
}

function draw() {
  if (mouseIsPressed) {
    app.drawStroke(pmouseX, pmouseY, mouseX, mouseY);
  }
  app.displayUI();
}

function mousePressed() { app.handleClick(mouseX, mouseY); }
function mouseDragged() { app.handleDrag(mouseX, mouseY); }
function mouseReleased() { app.handleRelease(); }

// ============================================================================
// ============================================================================
// TESTS START HERE
// ============================================================================
// ============================================================================

function runTests() {
  console.log("=== PAINT APP TESTS ===\n");

  // TEST: Button hit detection
  testSuite("Button.contains()", () => {
    test("clicks inside/outside", () => {
      const btn = new Button(10, 10, 30, 30, "TEST");
      expect(btn.contains(15, 15)).toBe(true);
      expect(btn.contains(10, 10)).toBe(true);
      expect(btn.contains(40, 40)).toBe(true);
      expect(btn.contains(9, 15)).toBe(false);
      expect(btn.contains(41, 15)).toBe(false);
    });
  });

  // TEST: Slider hit detection
  testSuite("Slider.contains()", () => {
    test("clicks inside/outside", () => {
      const s = new Slider(100, 50, 200, 20, 1, 50, 25, "Test");
      expect(s.contains(150, 60)).toBe(true);
      expect(s.contains(100, 50)).toBe(true);
      expect(s.contains(99, 60)).toBe(false);
      expect(s.contains(301, 60)).toBe(false);
    });
  });

  // TEST: Slider value clamping
  testSuite("Slider.setValue()", () => {
    test("clamps value to range", () => {
      const s = new Slider(0, 0, 100, 20, 1, 50, 25, "Test");
      s.setValue(25);
      expect(s.getValue()).toBe(25);
      s.setValue(0);
      expect(s.getValue()).toBe(1);
      s.setValue(100);
      expect(s.getValue()).toBe(50);
    });
  });

  // TEST: Slider drag behavior
  testSuite("Slider drag", () => {
    test("updates when dragging, not when idle", () => {
      const s = new Slider(100, 50, 200, 20, 1, 50, 25, "Test");
      const initial = s.getValue();
      s.updateValue(300);
      expect(s.getValue()).toBe(initial); // Not dragging
      s.startDrag();
      expect(s.isDragging).toBe(true);
      s.updateValue(100);
      expect(s.getValue()).toBe(1);
      s.updateValue(300);
      expect(s.getValue()).toBe(50);
      s.stopDrag();
      expect(s.isDragging).toBe(false);
    });
  });

  // TEST: Settings encapsulation
  testSuite("ToolSettings", () => {
    test("brushSize clamps and validates", () => {
      const s = new ToolSettings();
      s.brushSize = 25;
      expect(s.brushSize).toBe(25);
      s.brushSize = 0;
      expect(s.brushSize).toBe(1);
      s.brushSize = 100;
      expect(s.brushSize).toBe(50);
      expect(s.isValidSize(25)).toBe(true);
      expect(s.isValidSize(0)).toBe(false);
      expect(s.isValidSize(51)).toBe(false);
    });
  });

  // TEST: Tool polymorphism
  testSuite("Tool inheritance", () => {
    test("tools have correct names", () => {
      expect(new BrushTool().getName()).toBe("Brush");
      expect(new EraserTool().getName()).toBe("Eraser");
    });
    test("EraserTool inherits from BrushTool", () => {
      const eraser = new EraserTool();
      expect(eraser instanceof BrushTool).toBe(true);
      expect(eraser instanceof BaseTool).toBe(true);
    });
  });

  // TEST: Button command pattern
  testSuite("Button execute()", () => {
    test("buttons execute correctly", () => {
      const colorBtn = new ColorButton(0, 0, 30, 30, [255, 0, 0], "RED");
      const mock1 = { called: false, setColor: function() { this.called = true; } };
      colorBtn.execute(mock1);
      expect(mock1.called).toBe(true);
      
      const tool = new BrushTool();
      const toolBtn = new ToolButton(0, 0, 30, 30, tool, "BR");
      const mock2 = { t: null, setTool: function(x) { this.t = x; } };
      toolBtn.execute(mock2);
      expect(mock2.t).toBe(tool);
    });
  });
  
  // Clear Button Test
  testSuite("ClearButton execute()", () => {
  test("clears canvas when clicked", () => {
    const clearBtn = new ClearButton(0, 0, 30, 30, "CLEAR");
    const mock = { cleared: false, clearCanvas: function() { this.cleared = true; } };
    clearBtn.execute(mock);
    expect(mock.cleared).toBe(true);
  });
});

  // TEST: Drawing area boundary
  testSuite("Drawing boundaries", () => {
    test("isInDrawingArea checks boundary", () => {
      const app = createMockApp();
      expect(app.isInDrawingArea(100, 100)).toBe(true);
      expect(app.isInDrawingArea(200, 339)).toBe(true);
      expect(app.isInDrawingArea(100, 340)).toBe(false);
      expect(app.isInDrawingArea(100, 360)).toBe(false);
    });
    test("drawStroke respects boundaries", () => {
      const app = createMockApp();
      let called = false;
      app.currentTool = { apply: () => { called = true; } };
      
      app.drawStroke(100, 100, 150, 150);
      expect(called).toBe(true);
      
      called = false;
      app.drawStroke(100, 360, 150, 100);
      expect(called).toBe(false);
      
      called = false;
      app.drawStroke(100, 100, 150, 360);
      expect(called).toBe(false);
    });
  });

  console.log("\n=== ALL TESTS COMPLETE ===");
}

// ============================================================================
// TEST HELPERS
// ============================================================================

function createMockApp() {
  return {
    settings: new ToolSettings(),
    tools: { brush: new BrushTool(), eraser: new EraserTool() },
    currentTool: new BrushTool(),
    buttons: [],
    slider: new Slider(180, 365, 140, 10, 1, 50, 8, "Size:"),
    bgColor: 225,
    uiZoneTop: 340,
    setTool: function(tool) { this.currentTool = tool; },
    setActiveInGroup: PaintApp.prototype.setActiveInGroup,
    isInDrawingArea: PaintApp.prototype.isInDrawingArea,
    drawStroke: PaintApp.prototype.drawStroke
  };
}

function testSuite(name, fn) {
  console.log(`\n${name}`);
  fn();
}

function test(name, fn) {
  try {
    fn();
    console.log(`  ✓ ${name}`);
  } catch (e) {
    console.log(`  ✗ ${name}`);
    console.error(`    ${e.message}`);
  }
}

function expect(actual) {
  return {
    toBe(expected) {
      if (actual !== expected) {
        throw new Error(`Expected ${expected} but got ${actual}`);
      }
    }
  };
}