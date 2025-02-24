import { Router } from 'express';
const router = Router();
import fs from 'fs';
import { v4 as uuidv4 } from 'uuid';


import HistoryService from '../../service/historyService.js';
import WeatherService from '../../service/weatherService.js';

// TODO: POST Request with city name to retrieve weather data
router.post('/', async (req, res) => {
  // TODO: GET weather data from city name
  try {
    const cityName = req.body.cityName;
    console.log("trying to find weather for city: ", cityName);
    const weatherData = await WeatherService.getWeatherForCity(cityName);
    await HistoryService.addCity(cityName);
    return res.json(weatherData);
  } catch (error) {
    return res.status(500).json({ error: 'Failed to retrieve weather data' });
  }
} );
    // GET weather data from city name
    router.get('/history', async (_req, res) => {
      try {
        const history = await HistoryService.getCities();
        return res.json(history);
      //  const cityName = req.query.cityName as string;
       // const weather = await WeatherService.getWeatherForCity(cityName);
      //  return res.status(200).json(weather);
      } catch (error) {
        return res.status(500).json({ error: 'Failed to retrieve history data' })
      }
    });
    // TODO: save city to search history
    router.post('/api/weather', (req:any, res:any) => {
      const cityName = req.body.city; // Get the city name from the request body
  
      // Check if city name is provided
      if (!cityName) {
          return res.status(400).json({ error: 'City name is required' });
      }
        // Read existing search history
      fs.readFile('searchHistory.json', 'utf8', (err, data) => {
          if (err) {
              return res.status(500).json({ error: 'Failed to read search history' });
          }
  
          // Parse the existing data or initialize an empty array
          let searchHistory = JSON.parse(data || '[]');
  
          // Create a new city object with a unique ID
          const newCity = {
              id: uuidv4(), // Generate a unique ID
              name: cityName // Store the city name
          };
  
          // Add the new city to the search history
          searchHistory.push(newCity);
  
          // Write the updated search history back to the file
          fs.writeFile('searchHistory.json', JSON.stringify(searchHistory), (err) => {
              if (err) {
                  return res.status(500).json({ error: 'Failed to save search history' });
              }
  
              // Respond with a success message and the new city object
              res.json({ message: 'City saved successfully', city: newCity });
          });
      });
  });
    

// TODO: GET search history  --> endpoint: /api/weather/history w/ GET method
router.get('/history', async (_req, res) => {
  try {
    const history = await HistoryService.getCities();
    res.json(history);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to retrieve search history' });
  }
});

// * BONUS TODO: DELETE city from search history
router.delete('/history/:id', async (req, res) => {
  try {
    const { id } = req.params;
    await HistoryService.removeCity(id);
    res.json({ message: 'City removed from search history' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to remove city from search history' });
  }
});

export default router;
