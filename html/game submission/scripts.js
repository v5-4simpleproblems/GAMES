document.getElementById('uploadForm').addEventListener('submit', async (e) => {
  e.preventDefault();
  
  const discordUsername = document.getElementById('discordUsername').value;
  const gameName = document.getElementById('gameName').value;
  const gameLink = document.getElementById('gameLink').value;
  const gameZip = document.getElementById('gameZip').files[0];
  
  if (!discordUsername || !gameName || !gameLink || !gameZip) {
    alert("Please fill in all fields.");
    return;
  }

  // Constructing form data to include both text and file inputs
  const formData = new FormData();
  formData.append('content', `**Discord Username:** ${discordUsername}\n**Game Name:** ${gameName}\n**Game Link:** ${gameLink}`);
  formData.append('file', gameZip);

  const webhookUrl = 'https://discord.com/api/webhooks/1295097399127048262/efXXPsJLtVPFYDI7EVhpgKkteIuJxlRdFTLbUGq1Dw1UGhB-SE-T7AyZ4YZQKx_PD6yJ'; // Replace with your Discord webhook URL

  try {
    const response = await fetch(webhookUrl, {
      method: 'POST',
      body: formData
    });
    
    if (response.ok) {
      alert("Game submitted successfully!");
      document.getElementById('uploadForm').reset(); // Reset the form after successful submission
    } else {
      alert("Failed to submit the game. Please check your webhook URL and permissions.");
    }
  } catch (error) {
    console.error('Error:', error);
    alert("Failed to submit the game.");
  }
});
