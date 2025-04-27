// public/script.js
document.getElementById('loadDataBtn').addEventListener('click', async () => {
    try {
      const response = await fetch('/api/data');
      const data = await response.json();
      document.getElementById('message').innerText = data.message;
    } catch (error) {
      console.error('Error al cargar los datos:', error);
    }
  });
  