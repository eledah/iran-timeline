// Set the axis length as a constant
const AXIS_LENGTH = 20000;

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
      htmlContent += `<svg width="${AXIS_LENGTH}px" height="100%">`; // Use the constant for SVG width and set height to 100%

      // Create horizontal axis
      htmlContent += `<line x1="0" y1="50" x2="${AXIS_LENGTH}px" y2="50" stroke="black"/>`; // Use the constant for x2

      // Iterate through the data and draw rectangles for each person
      data.forEach((person, index) => {
        const birthYear = person.birth ? parseInt(person.birth) : null;
        const deathYear = person.death ? parseInt(person.death) : 2020;

        if (!isNaN(birthYear)) {
          // Calculate rectangle position and dimensions
          const rectX = (birthYear / 2020) * AXIS_LENGTH; // Scale the x-coordinate based on the axis length
          let rectWidth = isNaN(deathYear) ? AXIS_LENGTH - rectX : (deathYear / 2020) * AXIS_LENGTH - rectX; // Scale the width

          // Adjust the height to prevent collision
          const rectY = findAvailableY(rectX, rectWidth, data.slice(0, index));

          // Draw rectangle
          htmlContent += `<rect x="${rectX}" y="${rectY}" width="${rectWidth}" height="40" fill="blue" stroke="black"/>`;

          // Add text in the middle of the rectangle
          const textX = rectX + rectWidth / 2;
          const textY = rectY + 20; // Centered on the rectangle
          htmlContent += `<text x="${textX}" y="${textY}" text-anchor="middle" alignment-baseline="middle" fill="white">${person.name}</text>`;
        }
      });

      htmlContent += '</svg>';
      htmlContent += '</div>';
      htmlContent += '</div>';

      // Append the HTML content to the body or any other container element
      document.body.innerHTML += htmlContent;
    })
    .catch(error => {
      console.error('Error fetching CSV file:', error);
    });
}

// Function to find an available y-coordinate to prevent overlap with previous people
function findAvailableY(rectX, rectWidth, previousPeople) {
    const rectEnd = rectX + rectWidth;
    let rectY = 30;
    let collisions = 0;
  
    // Iterate through the array of previous people
    for (const person of previousPeople) {
      const prevBirthYear = person.birth ? parseInt(person.birth) : null;
      const prevDeathYear = person.death ? parseInt(person.death) : 2020;
  
      if (!isNaN(prevBirthYear)) {
        const prevRectX = (prevBirthYear / 2020) * AXIS_LENGTH;
        const prevRectWidth = isNaN(prevDeathYear) ? AXIS_LENGTH - prevRectX : (prevDeathYear / 2020) * AXIS_LENGTH - prevRectX;
  
        // Check for overlap with the previous person's rectangle
        if (!(rectEnd <= prevRectX || rectX >= prevRectX + prevRectWidth)) {
          // If there is overlap, increment the collisions count and move the rectangle down
          collisions++;
          rectY += 50 * collisions; // Move the rectangle vertically based on the number of collisions
        }
      }
    }
  
    return rectY;
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
