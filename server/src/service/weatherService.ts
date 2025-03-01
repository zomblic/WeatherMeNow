import dotenv from 'dotenv';
dotenv.config();
import dayjs, { type Dayjs } from 'dayjs';

// TODO: Define an interface for the Coordinates object
interface Coordinates {
  lat: number;
  lon: number;
}
// TODO: Define a class for the Weather object
class Weather {
  tempF: number;
  humidity: number;
  windSpeed: number;
  icon: string;
  date: Dayjs | string;
  city: string;
  iconDescription: string;

  constructor(
    tempF: number,
    humidity: number,
    windSpeed: number,
    icon: string,
    date: Dayjs | string,
    city: string,
    iconDescription: string
  ) {
    this.tempF = tempF;
    this.humidity = humidity;
    this.windSpeed = windSpeed;
    this.icon = icon;
    this.date = date;
    this.city = city;
    this.iconDescription = iconDescription;
  }
}
// TODO: Complete the WeatherService class
class WeatherService {
  // TODO: Define the baseURL, API key, and city name properties
  private baseURL: string = process.env.API_BASE_URL || '';
  private apiKey: string = process.env.API_KEY || '';
  private cityName?: any;


  // TODO: Create fetchLocationData method
  private async fetchLocationData(query: any) {
    return fetch(query)
      .then((response) => response.json())
      .then((data) => {
        const { lat, lon } = data[0];
        return { lat, lon };
      });
  }
  // TODO: Create destructureLocationData method
  private destructureLocationData(locationData: any) {
    // console.log(locationData);
    const { lat, lon } = locationData;
    return { lat, lon }

  }

  // TODO: Create buildGeocodeQuery method
  private buildGeocodeQuery(): string {
    // console.log(`${this.baseURL}geo/1.0/direct?q=${this.cityName}&limit=1&appid=${this.apiKey}`)
    return `${this.baseURL}geo/1.0/direct?q=${this.cityName}&limit=1&appid=${this.apiKey}`;
  }

  // TODO: Create buildWeatherQuery method
  private buildWeatherQuery(coordinates: any) {
    const { lat, lon } = coordinates;
    // console.log(`${this.baseURL}data/2.5/forecast?lat=${lat}&lon=${lon}&appid=${this.apiKey}&units=imperial`);
    return `${this.baseURL}data/2.5/forecast?lat=${lat}&lon=${lon}&appid=${this.apiKey}&units=imperial`;
  }
  // TODO: Create fetchAndDestructureLocationData method
  private async fetchAndDestructureLocationData(): Promise<Coordinates> {
    try {
      const geoQuery = this.buildGeocodeQuery();
      const locationData = await this.fetchLocationData(geoQuery);
      const destructureLocationData = this.destructureLocationData(locationData);
      return destructureLocationData;
    } catch (error: any) {
      console.error('Error fetching and destructuring location data:', error);
      throw error; // Rethrow the error for further handling if needed
    }
  }

  // TODO: Create fetchWeatherData method
  private async fetchWeatherData(coordinates: Coordinates): Promise<any> {
    try {
      const response = await fetch(this.buildWeatherQuery(coordinates));
      if (!response.ok) {
        throw new Error('Failed to fetch weather data');
      }
      const data = await response.json();
      return data;
    } catch (error: any) {
      console.log(error);
      throw error;
    }
  }

  // TODO: Build parseCurrentWeather method
  private parseCurrentWeather(response: any) {
    const data = response.list[0];
    const parsedDate = dayjs.unix(data.dt).format('MM/DD/YYYY');
    const weather = new Weather(
      data.main.temp,
      data.main.humidity,
      data.wind.speed,
      data.weather[0].icon,
      parsedDate,
      this.cityName,
      data.weather[0].description,
    );
    return weather;
  };
  // TODO: Complete buildForecastArray method
  private buildForecastArray(currentWeather: Weather, weatherData: any[]) {
    const weatherForecast: Weather[] = [currentWeather];
    const specificWeatherData = weatherData.filter((data) => {
      return data.dt_txt.includes('12:00:00');
    });
    for (const day of specificWeatherData) {
      weatherForecast.push(new Weather(
        day.main.temp,
        day.main.humidity,
        day.wind.speed,
        day.weather[0].icon,
        dayjs.unix(day.dt).format('MM/DD/YYYY'),
        this.cityName,
        day.weather[0].description,
      )
      )
    };

    return weatherForecast;
  }
  // TODO: Complete getWeatherForCity method
  async getWeatherForCity(city: string) {
    this.cityName = city;
    const coordinates = await this.fetchAndDestructureLocationData();
    const weatherData = await this.fetchWeatherData(coordinates);
    const currentWeather = await this.parseCurrentWeather(weatherData);
    const forecastArray = await this.buildForecastArray(currentWeather, weatherData.list);
    return forecastArray;
  }
}

export default new WeatherService();
