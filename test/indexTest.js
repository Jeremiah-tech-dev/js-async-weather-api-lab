const expect = require('expect')
const fs = require('fs')
const jsdom = require('jsdom')
const path = require('path')

describe('index', () => {
  before(done => {
    const html = path.resolve(__dirname, '..', 'index.html')
    const src = path.resolve(__dirname, '..', 'index.js')

    jsdom.env(html, [src], (err, window) => {
      if (err) {
        return done(err)
      }

      Object.keys(window).forEach(key => {
        global[key] = window[key]
      })

      done()
    })
  })

  describe('index.html', () => {
    it('starts off without data content', () => {
      expect(document.querySelector('#temp')).toExist()
      expect(document.querySelector('#temp').innerText).toNotExist()
      expect(document.querySelector('#low')).toExist()
      expect(document.querySelector('#low').innerText).toNotExist()
      expect(document.querySelector('#high')).toExist()
      expect(document.querySelector('#high').innerText).toNotExist()
      expect(document.querySelector('#humidity')).toExist()
      expect(document.querySelector('#humidity').innerText).toNotExist()
    })

    it('is populated with weather data after form submission', () => {
      const json = {
        cod: 200,
        name: "London",
        main: {
          temp: "50",
          temp_min: "40",
          temp_max: "60",
          humidity: "30"
        },
        clouds: {
          all: "60"
        }
      }

      displayCurrentWeather(json)


      expect(document.querySelector('#temp').innerHTML).toMatch('50', "temperature data not found in #temp");
      expect(document.querySelector('#low').innerHTML).toMatch('40', "temp_min data not found in #low");
      expect(document.querySelector('#high').innerHTML).toMatch('60', "temp_max data not found in #high");
      expect(document.querySelector('#humidity').innerHTML).toMatch('30', "humidity data not found in #humidity");
      expect(document.querySelector('#cloudCover').innerHTML).toMatch('60', "clouds.all data not found in #cloudCover");
    })

    it('is populated with forecast data after form submission', () => {
      const json = {
        cod: "200",
        list: [
          {dt_txt: "1", main: {temp: "50", humidity: "50"}},
          {dt_txt: "2", main: {temp: "51", humidity: "51"}},
          {dt_txt: "3", main: {temp: "52", humidity: "52"}},
          {dt_txt: "4", main: {temp: "53", humidity: "53"}},
          {dt_txt: "5", main: {temp: "54", humidity: "54"}},
          {dt_txt: "6", main: {temp: "55", humidity: "55"}},
          {dt_txt: "7", main: {temp: "56", humidity: "56"}},
          {dt_txt: "8", main: {temp: "57", humidity: "57"}}
        ]
      }

      displayFiveDayForecast(json)

      expect(document.querySelector('aside').children.length).toEqual(8, "Wrong number of child elements within <aside>");
      expect(document.querySelector('aside').children[0].innerHTML).toMatch('50', "Incorrect data in aside child elements");
      expect(document.querySelector('aside').children[1].innerHTML).toMatch('51', "Incorrect data in aside child elements");
      expect(document.querySelector('aside').children[2].innerHTML).toMatch('52', "Incorrect data in aside child elements");
    })

  })

  describe('index.js', () => {
    let fetchSpy
    before(() => {
      window.fetch = require('node-fetch')

    })

    beforeEach(() => {
      document.getElementById('city').value = '' // Clear input before each test
      fetchSpy = expect.spyOn(window, "fetch").andReturn(new Promise(() => {}))
    })

    afterEach(() => {
      fetchSpy.restore()
    })

    it('fetches the current weather', () => {

      fetchCurrentWeather("London")

      expect(fetchSpy.calls.length).toEqual(1, "fetch() wasn't called")
      const url = fetchSpy.calls[0].arguments[0]

      expect(url).toMatch('https://api.openweathermap.org/data/2.5/weather')
    })

    it('sends a second fetch request for the 5-day forecast', () => {

      fetchFiveDayForecast("London")

      expect(fetchSpy.calls.length).toEqual(1, "fetch() wasn't called")
      const url = fetchSpy.calls[0].arguments[0]

      expect(url).toMatch('https://api.openweathermap.org/data/2.5/forecast')

    })

    it('calls both fetch requests upon form submission', () => {

      document.getElementById('city').value = 'London'
      const fakeEvent = {
        preventDefault: () => null,
        target: document.getElementById('cityForm')
      }

      handleFormSubmit(fakeEvent)

      expect(fetchSpy.calls.length).toEqual(2, "fetch() wasn't called a second time")
      const url = fetchSpy.calls[0].arguments[0]
      const url2 = fetchSpy.calls[1].arguments[0]

      expect(url).toMatch(/(weather|forecast)/)
      expect(url2).toMatch(/(weather|forecast)/)
      expect(url).toNotMatch(url2)
    })
    it('fetches using the correct URL structure for multi-word city names', () => {
      const city = document.getElementById('city')
      const submit = document.getElementById('cityForm').children[1]
      expect(city).toExist()
      expect(submit).toExist()

      city.value = "New York"
      const fakeEvent = {
        preventDefault: () => null,
        target: document.getElementById('cityForm')
      }

      handleFormSubmit(fakeEvent)

      expect(fetchSpy.calls.length).toEqual(2, "fetch() wasn't called")

      const url = fetchSpy.calls[0].arguments[0]

      expect(url).toMatch('New+York')


    })


  })
})
