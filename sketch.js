let data;
let dataRows;
let glyphs = [];
let riverCanvas;
let tooltip;

const CONFIG = {
  pageColor: "#f4f4f4",
  rectColor: "#1a4b84",
  textColor: "#333",
  padding: 20,
  baseWidth: 5,
  titlePadding: 60,
  spacing: 10, // Spaziatura tra i rettangoli
  itemHeight: 30, // Altezza base dei rettangoli
  captionSpacing: 60, // Spazio tra il titolo e la didascalia
  captionWidth: 0.8, // Larghezza relativa della didascalia (percentuale della canvas)
};

function preload() {
  data = loadTable("assets/data.csv", "csv", "header");
  tooltip = createDiv('')
    .position(0, 0)
    .style('display', 'none')
    .style('position', 'absolute')
    .style('background-color', '#fff')
    .style('border', `1px solid ${CONFIG.rectColor}`)
    .style('border-radius', '5px')
    .style('padding', '10px')
    .style('font-size', '12px')
    .style('z-index', '10');
}

function setup() {
  dataRows = data.getRows()
    .sort((a, b) => b.getNum("length") - a.getNum("length"))
    .filter(row => row.getString("name") && row.getNum("length") && row.getNum("area"));

  let totalHeight = (10 + 20) * dataRows.length + CONFIG.titlePadding; 
  
  createCanvas(windowWidth, totalHeight);
  riverCanvas = createGraphics(width, height);
  renderVisualization();
}

function renderVisualization() {
  const maxArea = max(dataRows.map(row => row.getNum("area")));
  const maxLength = max(dataRows.map(row => row.getNum("length")));

  glyphs = [];
  let xPos = width / 2; // Centro della canvas per i rettangoli
  let yPos = CONFIG.titlePadding + CONFIG.captionSpacing + 40; // Spazio dopo la didascalia

  dataRows.forEach((item, i) => {
    const normalizedArea = pow(item.getNum("area") / maxArea, 0.7);
    const normalizedLength = item.getNum("length") / maxLength;

    const glyph = new Glyph(
      xPos,
      yPos,
      item.getString("name"),
      normalizedLength,
      normalizedArea,
      width,
      {
        length: item.getNum("length"),
        area: item.getNum("area"),
      }
    );

    glyphs.push(glyph);
    yPos += glyph.height + CONFIG.spacing; // Incrementa la posizione verticale
  });

  renderGraphics();
}

function renderGraphics() {
  riverCanvas.clear();
  riverCanvas.background(CONFIG.pageColor);

  // Titolo
  riverCanvas.textSize(28);
  riverCanvas.textStyle(BOLD);
  riverCanvas.textAlign(CENTER, TOP);
  riverCanvas.fill(CONFIG.textColor);
  riverCanvas.text("TOP 100 RIVERS", width / 2, CONFIG.padding);

  // Didascalia sotto il titolo
  const captionY = CONFIG.titlePadding; // Posizione sotto il titolo
  const captionWidth = width * CONFIG.captionWidth;
  riverCanvas.textSize(16);
  riverCanvas.textStyle(NORMAL);
  riverCanvas.textAlign(CENTER, TOP);
  riverCanvas.fill(CONFIG.textColor);
  const explanation = "Each rectangle represents a river. The height indicates the length, while the width represents the basin area. Hover over a rectangle to see the details.";
  riverCanvas.text(explanation, (width - captionWidth) / 2, captionY, captionWidth);

  // Disegna i rettangoli dei fiumi
  glyphs.forEach(glyph => glyph.render(riverCanvas, false));

  image(riverCanvas, 0, 0);
}

function draw() {
  image(riverCanvas, 0, 0);

  // Identifica se il mouse è sopra uno dei rettangoli
  let hoveredGlyph = null;
  glyphs.forEach(glyph => {
    if (glyph.isHovered()) {
      hoveredGlyph = glyph;
    }
  });

  // Disegna i rettangoli e cambia colore se è hovered
  glyphs.forEach(glyph => {
    const isHovered = hoveredGlyph === glyph;
    glyph.render(riverCanvas, isHovered);
  });

  // Se un rettangolo è hovered, mostriamo la tooltip
  if (hoveredGlyph) {
    hoveredGlyph.renderTooltip();
  } else {
    tooltip.style('display', 'none');
  }
}

class Glyph {
  constructor(x, y, name, normalizedLength, normalizedArea, canvasWidth, details) {
    this.x = x;
    this.y = y;
    this.name = name;
    this.details = details;

    const maxRectWidth = canvasWidth * 0.7;
    const maxRectHeight = CONFIG.itemHeight;

    this.width = map(normalizedArea, 0, 1, CONFIG.baseWidth, maxRectWidth);
    this.height = map(normalizedLength, 0, 1, 10, maxRectHeight);
  }

  render(canvas, isHovered) {
    canvas.push();
    // Cambia il colore solo se il rettangolo è hovered
    const fillColor = isHovered ? '#000035' : CONFIG.rectColor;
    canvas.fill(fillColor);
    canvas.noStroke();
    canvas.rectMode(CENTER);
    canvas.rect(this.x, this.y, this.width, this.height);
    canvas.pop();
  }

  isHovered() {
    return (
      mouseX >= this.x - this.width / 2 &&
      mouseX <= this.x + this.width / 2 &&
      mouseY >= this.y - this.height / 2 &&
      mouseY <= this.y + this.height / 2
    );
  }

  renderTooltip() {
    tooltip.html(`
      <strong>${this.name}</strong><br>
      Lunghezza: ${this.details.length} km<br>
      Area bacino: ${this.details.area} km²
    `);
    tooltip.position(mouseX + 10, mouseY);
    tooltip.style('display', 'block');
  }
}

function windowResized() {
  setup();
}
