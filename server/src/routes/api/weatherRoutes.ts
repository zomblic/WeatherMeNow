import { Router } from 'express';
const router = Router();


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
    const saveCityToSearchHistory = async (cityName: string) => {
      try {
        await HistoryService.addCity(cityName);
      } catch (error) {
        console.error('Failed to save city to search history:', error);
      }
    };
  
          // Write the updated search history back to the file
          router.post('/', async (req, res) => {
            try {
              const cityName = req.body.cityName;
              console.log("trying to find weather for city: ", cityName);
              const weatherData = await WeatherService.getWeatherForCity(cityName);
              
              // Save city to search history
              await saveCityToSearchHistory(cityName);
              
              return res.json(weatherData);
            } catch (error) {
              return res.status(500).json({ error: 'Failed to retrieve weather data' });
            }
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
