// Set the axis length as a constant
const AXIS_LENGTH = 20000;
const COLLISION_OFFSET = 25; // Constant for adjusting the position in case of collision
const RECT_HEIGHT = 20

// List to store the coordinates of existing rectangles
const existingRectangles = [];

const typeColorMap = {
  'PHILOSOPHER': '#EF4444',
  'RELIGIOUS FIGURE': '#F97316',
  'MATHEMATICIAN': '#F59E0B',
  'POLITICIAN': '#3B82F6',
  'WRITER': '#22C55E',
  'CHEMIST': '#14532D',
  'PHYSICIAN': '#064E3B',
  'ASTRONOMER': '#134E4A',
  'COMPANION': '#164E63',
  'MILITARY PERSONNEL': '#0C4A6E',
  'FILM DIRECTOR': '#1E3A8A',
  'SOCIAL ACTIVIST': '#312E81',
  'EXPLORER': '#4C1D95',
  'LINGUIST': '#701A75',
  'CELEBRITY': '#831843',
  'HISTORIAN': '#881337',
  'LAWYER': '#B91C1C',
  'PAINTER': '#C2410C',
  'ACTOR': '#B45309',
  'NOBLEMAN': '#A16207',
  'SINGER': '#B45309',
  'SOCCER PLAYER': '#A16207',
  'WRESTLER': '#4D7C0F',
  'TENNIS PLAYER': '#15803D',
  'COMIC ARTIST': '#047857',
  'ENGINEER': '#0F766E',
  'BIOLOGIST': '#0E7490',
  'PHOTOGRAPHER': '#0369A1',
  'PHYSICIST': '#1D4ED8',
  'PORNOGRAPHIC ACTOR': '#4338CA',
  'MUSICIAN': '#6D28D9',
  'REFEREE': '#7E22CE',
};

// Function to read CSV file and create the horizontal timeline
function createHorizontalTimeline() {
  // Set the CSV file path
  const csvFilePath = 'https://raw.githubusercontent.com/eledah/iran-timeline/main/iran.csv';

  // Fetch the CSV file
  fetch(csvFilePath)
    .then(response => response.text())
    .then(csvData => {
      // Parse CSV data
      const data = parseCSV(csvData);

      // Create HTML content for the timeline
      let htmlContent = '<div class="scrollable-container">'; // Add a div for scrollability
      htmlContent += '<div class="timeline-container">'; // Set the main div
      htmlContent += `<svg width="${calculateMaxWidth()}px" height="${calculateMaxHeight()}px">`; // Set dynamic width and height

      // Add numbers above the axis
      for (let year = -2000; year <= 2000; year += 50) {
        const yearX = (year + 2000) * (AXIS_LENGTH / 4000);
        const yearTextX = yearX - 5; // Adjust for better positioning
        const yearTextY = 40; // Adjust for better positioning
        htmlContent += `<text x="${yearTextX}" y="${yearTextY}" text-anchor="middle" alignment-baseline="middle" fill="black">${year}</text>`;
      }

      // Create horizontal axis
      htmlContent += `<line x1="0" y1="50" x2="${calculateMaxWidth()}px" y2="50" stroke="black"/>`; // Set dynamic x2

      // Iterate through the data and draw rectangles for each person
      data.forEach((person, index) => {
        const birthYear = person.birth ? parseInt(person.birth) : null;
        const deathYear = person.death ? parseInt(person.death) : 2020;

        if (!isNaN(birthYear)) {
          // Calculate rectangle position and dimensions
          const rectX = (birthYear + 2000) * (AXIS_LENGTH / 4000); // Adjust for birth years starting from -2000
          let rectWidth = isNaN(deathYear) ? 20000 - rectX : (deathYear + 2000) * (AXIS_LENGTH / 4000) - rectX; // Adjust for birth years starting from -2000

          // Adjust the height to prevent collision
          const rectY = findAvailableY(rectX, rectWidth, person.name);

          // Add text in the middle of the rectangle as a hyperlink
          const link = person.link ? person.link : '#';
          const textX = rectX + rectWidth / 2;
          const textY = rectY + (RECT_HEIGHT) / 2 + 5; // Centered on the rectangle
          const hpi = person.hpi ? person.hpi : 'N/A'; // Assuming HPI is a property in your CSV data

          htmlContent += `<a href="${link}" target="_blank"><rect x="${rectX}" y="${rectY}" width="${rectWidth}" height="${RECT_HEIGHT}" fill="${getColor(person.type)}" rx="10" ry="10""</rect></a>`;
          htmlContent += `<a href="${link}" target="_blank"><text x="${textX}" y="${textY}" text-anchor="middle" alignment-baseline="middle" fill="white">${person.name}</text></a>`;


          // htmlContent += `<a href="${link}" target="_blank"><rect x="${rectX}" y="${rectY}" width="${rectWidth}" height="20" fill="${getColor(person.type)}" stroke="gray"/></a>`;
          // htmlContent += `<a href="${link}" target="_blank"><text x="${textX}" y="${textY}" text-anchor="middle" alignment-baseline="middle" fill="white">${person.name}</text></a>`;

          // Add the rectangle coordinates to the list
          existingRectangles.push({ x1: rectX, y1: rectY, x2: rectX + rectWidth, y2: rectY + 20 });
        }
      });

      htmlContent += '</svg>';
      htmlContent += '</div>';
      htmlContent += '</div>';

      // Append the HTML content to the body or any other container element
      document.body.innerHTML += htmlContent;

      // Set the <svg> height to the result of calculateMaxHeight()
      document.querySelector('svg').setAttribute('height', `${calculateMaxHeight()}px`);
      document.querySelector('svg').setAttribute('width', `${calculateMaxWidth()}px`);
      document.querySelector('line').setAttribute('x2', `${calculateMaxWidth()}px`);
    })
    .catch(error => {
      console.error('Error fetching CSV file:', error);
    });
}

// Function to find an available y-coordinate to prevent overlap with previous rectangles
function findAvailableY(rectX, rectWidth, name) {
  let rectY = 60;
  let collisions = 0;
  let collisionYs = [];
  const minY = 60;

  // Initialize the collisionYs array
  for (let y = rectY; y < calculateMaxHeight() + 400; y += COLLISION_OFFSET) {
    collisionYs.push(y);
  }

  // Iterate through the list of existing rectangles
  for (const existingRect of existingRectangles) {
    // Check for overlap with the existing rectangle
    if (!(rectX + rectWidth <= existingRect.x1 || rectX >= existingRect.x2)) {
      // If there is overlap, remove the corresponding y-coordinate from the array
      const index = Math.floor((existingRect.y1 - minY) / COLLISION_OFFSET);
      collisionYs[index] = undefined;
      collisions += 1;
    }
  }

  // Find the minimum remaining y-coordinate in the array
  const minRemainingY = collisionYs.find(y => y !== undefined) || minY;

  // Set rectY to the minimum remaining y-coordinate
  rectY = minRemainingY;

  console.log(name, collisions, rectY);

  return rectY;
}

// Function to get color based on the person's type
function getColor(type) {
  return typeColorMap[type];
}

// Function to calculate the maximum height inside existing rectangles
function calculateMaxHeight() {
  return Math.max(...existingRectangles.map(rectangle => rectangle.y2)) + COLLISION_OFFSET;
}

// Function to calculate the maximum width for the SVG element
function calculateMaxWidth() {
  return Math.max(...existingRectangles.map(rectangle => rectangle.x2)) + COLLISION_OFFSET;
}

// Function to parse CSV data
function parseCSV(csvData) {
  const rows = csvData.split('\n');
  const headers = rows[0].split(',');

  // Remove the last element if it is an empty string (indicating EOF)
  if (rows[rows.length - 1].trim() === '') {
    rows.pop();
  }

  return rows.slice(1).map(row => {
    const values = row.split(',');
    return headers.reduce((obj, header, index) => {
      obj[header.trim()] = values[index].trim();
      return obj;
    }, {});
  });
}

// Call the function to create the horizontal timeline
createHorizontalTimeline();
