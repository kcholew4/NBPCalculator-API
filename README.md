# NBPCalculator-API

Socket.io API used for retrieving NBP middle exchange rates in [NBPCalculator](https://github.com/kcholew4/NBPCalculator). Exchange rates are stored in the database and cached for increased performance.

## How to run

Make sure to provide mongodb connection string to the `MONGODB_CONNECTION_STRING` variable.

```bash
yarn install
```

```bash
yarn start
```

## Usage

All events are [acknowledgements](https://socket.io/docs/v4/emitting-events/#acknowledgements), payload is always required.

#### `table:range`

Returns range in which the data is available.

Payload:

```js
{}
```

Response:

```js
{
  ok: true,
  response: {
    max: "2022-01-07",
    min: "2002-01-02"
  }
}
```

#### `table:disabled-days`

Returns an array containing all dates that are not available in the specified month. Weekends are not included.

Payload:

```js
{
  year: 2021,
  month: 5
}
```

Response:

```js
{
  ok: true,
  response: [
    "2021-05-03"
  ]
}
```

#### `table:get`

Returns the NBP middle exchange rates (table A) for the specified date.

Payload:

```js
{
  date: "2021-05-25";
}
```

Response:

```js
{
  ok: true,
  response: {
    table: "099/A/NBP/2021",
    date: "2021-05-25",
    rates: [
      {
        code: "THB",
        rate: 0.1166
      },
      {
        code: "USD",
        rate: 3.6549
      },
      {...}
    ]
  }
}
```
