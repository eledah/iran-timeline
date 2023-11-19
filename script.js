// Function to read CSV file and create the horizontal timeline
function createHorizontalTimeline() {
    // Replace the URL with the path to your CSV file
    const csvFilePath = 'iran.csv';
  
    // Fetch the CSV file
    fetch(csvFilePath)
      .then(response => response.text())
      .then(csvData => {
        // Parse CSV data
        const data = parseCSV(csvData);
  
        // Create HTML content for the timeline
        let htmlContent = '<div class="timeline">';
        htmlContent += '<svg width="100%" height="100">';
  
        // Create horizontal axis
        htmlContent += '<line x1="0" y1="50" x2="100%" y2="50" stroke="black"/>';
  
        // Iterate through the data and draw rectangles for each person
        data.forEach(person => {
          const birthYear = person.birth ? parseInt(person.birth) : null;
          const deathYear = person.death ? parseInt(person.death) : 2020;
  
          if (!isNaN(birthYear)) {
            // Draw rectangle
            const rectX = birthYear + 2000; // Shift the x-coordinate based on the axis starting point
            const rectWidth = isNaN(deathYear) ? 2020 - birthYear : deathYear - birthYear;
            htmlContent += `<rect x="${rectX}" y="30" width="${rectWidth}" height="40" fill="blue" stroke="black"/>`;
          }
        });
  
        htmlContent += '</svg>';
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
  