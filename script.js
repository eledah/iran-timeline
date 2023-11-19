// Set the axis length as a constant
const AXIS_LENGTH = 2000;

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
      htmlContent += '<div class="timeline">';
      htmlContent += `<svg width="${AXIS_LENGTH}px" height="100">`; // Use the constant for SVG width

      // Create horizontal axis
      htmlContent += `<line x1="0" y1="50" x2="${AXIS_LENGTH}px" y2="50" stroke="black"/>`; // Use the constant for x2

      // Iterate through the data and draw rectangles for each person
      data.forEach(person => {
        const birthYear = person.birth ? parseInt(person.birth) : null;
        const deathYear = person.death ? parseInt(person.death) : 2020;

        if (!isNaN(birthYear)) {
          // Draw rectangle
          const rectX = (birthYear / 2020) * AXIS_LENGTH; // Scale the x-coordinate based on the axis length
          const rectWidth = isNaN(deathYear) ? AXIS_LENGTH - rectX : (deathYear / 2020) * AXIS_LENGTH - rectX; // Scale the width
          htmlContent += `<rect x="${rectX}" y="30" width="${rectWidth}" height="40" fill="blue" stroke="black"/>`;

          // Add text in the middle of the rectangle
          const textX = rectX + rectWidth / 2;
          const textY = 50; // Centered on the timeline
          htmlContent += `<text x="${textX}" y="${textY}" text-anchor="middle" alignment-baseline="middle" fill="white">${person.name}</text>`;
        }
      });

      htmlContent += '</svg>';
      htmlContent += '</div>';
      htmlContent += '</div>';

      // Append the HTML content to the body or any other container element
      document.querySelector('.timeline-container').innerHTML += htmlContent;
    })
    .catch(error => {
      console.error('Error fetching CSV file:', error);
    });
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
