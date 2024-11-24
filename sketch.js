let data;
let dataRows;

// Colori
let pageColor = "white";
let rectColor = "darkblue";
let textColor = "black";

// Dimensioni e padding
let padding = 80;
let baseWidth = 60;
let titlePadding = 100; // Spazio extra per il titolo

function preload() {
  data = loadTable("assets/data.csv", "csv", "header");
}

function setup() {
  dataRows = data.getRows();
  dataRows.sort((a, b) => b.getNum("length") - a.getNum("length")); 

  // Calcolo responsive di totalHeight con spazio per titolo e descrizione
  let itemHeight = 80;
  let spacing = padding;
  let totalHeight = titlePadding + (itemHeight + spacing) * dataRows.length + padding * 3 + 200; // Extra spazio per la descrizione
  
  totalHeight = max(totalHeight, windowHeight);
  
  createCanvas(windowWidth, totalHeight);
  background(pageColor);

  // Aggiungi il titolo
  textSize(36);
  textStyle(BOLD);
  textAlign(CENTER, CENTER);
  fill(textColor);
  text("I 100 FIUMI PIÙ LUNGHI DEL MONDO", windowWidth/2, titlePadding/2);

  let xPos = windowWidth / 2;
  let yPos = titlePadding; // Inizia dopo il titolo

  // Trova i valori massimi e minimi
  let maxArea = 0;
  let minArea = Infinity;
  let maxLength = 0;
  let minLength = Infinity;
  
  for (let row of dataRows) {
    let area = row.getNum("area");
    let length = row.getNum("length");
    maxArea = max(maxArea, area);
    minArea = min(minArea, area);
    maxLength = max(maxLength, length);
    minLength = min(minLength, length);
  }

  // Usa una scala mista per bilanciare le differenze
  for (let i = 0; i < dataRows.length; i++) {
    let item = dataRows[i];
    let name = item.getString("name");
    let length = item.getNum("length");
    let area = item.getNum("area");

    if (name && length && area) {
      let normalizedArea = pow(area / maxArea, 0.7);
      let normalizedLength = length / maxLength;
      
      drawGlyph(xPos, yPos, name, normalizedLength, normalizedArea, maxLength);
      yPos += itemHeight + spacing;
    } else {
      console.log(`Dati mancanti per la riga ${i + 1}`);
    }
  }

  // Aggiungi la descrizione alla fine
  textSize(20);
  textStyle(NORMAL);
  textAlign(CENTER, TOP);
  fill(textColor);
  let description = "Questa visualizzazione rappresenta i 100 fiumi più lunghi del mondo. " +
                   "La larghezza di ogni rettangolo è proporzionale all'area del bacino del fiume, " +
                   "mentre l'altezza è proporzionale alla sua lunghezza. " +
                   "I fiumi sono ordinati dal più lungo al più corto, offrendo una prospettiva " +
                   "immediata sulla loro grandezza relativa e sull'impatto dei loro bacini idrografici.";
  
  let descriptionY = yPos + padding;
  text(description, windowWidth/2 - windowWidth/4, descriptionY, windowWidth/2, 200);
}

function windowResized() {
  setup();
}

function draw() {
  // La funzione draw è vuota perché il disegno è gestito in setup
}

function drawGlyph(x, y, name, normalizedLength, normalizedArea, maxLength) {
  let maxRectWidth = windowWidth * 0.9 ;
  let maxRectHeight = 120; // Aumentata l'altezza massima dei rettangoli
  
  let rectWidth = map(normalizedArea, 0, 1, baseWidth, maxRectWidth);
  let rectHeight = map(normalizedLength, 0, 1, 30, maxRectHeight); // Aumentata anche l'altezza minima

  fill(rectColor);
  noStroke();
  rect(x - rectWidth / 2, y, rectWidth, rectHeight);

  fill(textColor);
  textAlign(CENTER, CENTER);
  textSize(18);
  text(name, x, y + rectHeight + 15);
}