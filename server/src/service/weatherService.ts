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
  private cityName: string = '';
  lat: any;
  lon: any;

  // TODO: Create fetchLocationData method
  private async fetchLocationData(query: string): Promise<any> {
    try {
      const response = await fetch(query);

      if (!response.ok) {
        throw new Error('Failed to fetch location data');
      }
      const data = await response.json();
      return data;
    }
    catch (error: any) {
      console.log(error);
    }
  }
  // TODO: Create destructureLocationData method
  private destructureLocationData(locationData: Coordinates): Coordinates {
    return {
      lat: locationData.lat,
      lon: locationData.lon,
    };
  }

  // TODO: Create buildGeocodeQuery method
  private buildGeocodeQuery(): string {
    return `${this.baseURL}geo/1.0/direct?q=${this.cityName}&limit=1&appid=${this.apiKey}`;
  }

  // TODO: Create buildWeatherQuery method
  private buildWeatherQuery(_coordinates: Coordinates): string {
    return `${this.baseURL}data/2.5/forecast?lat=${this.lat}&lon=${this.lon}&appid=${this.apiKey}&units=imperial`;
  }
  // TODO: Create fetchAndDestructureLocationData method
  private async fetchAndDestructureLocationData(): Promise<Coordinates> {
    const geoQuery = this.buildGeocodeQuery();
    const locationData = await this.fetchLocationData(geoQuery);
    const destructureLocationData = this.destructureLocationData(locationData);
    return destructureLocationData;
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
    )};
    
    return weatherForecast;
  }
  // TODO: Complete getWeatherForCity method
  async getWeatherForCity(city: string): Promise<{ currentWeather: Weather; forecastArray: Weather[] }> {
    this.cityName = city;
    const coordinates = await this.fetchAndDestructureLocationData();
    const weatherData = await this.fetchWeatherData(coordinates);
    const currentWeather = this.parseCurrentWeather(weatherData);
    const forecastArray = this.buildForecastArray(currentWeather, weatherData.list);
    return { currentWeather, forecastArray };
  }
}

export default new WeatherService();
