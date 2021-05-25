# NBPCalculator-API

A websocket API for [NBPCalculator](https://github.com/kcholew4/NBPCalculator).

## How to run

```bash
yarn install
```

```bash
yarn start
```

## Usage

Message is sent in JSON format and must contain:

- "id" - An integer that's passed to the response
- "method" - Name of a method (See available methods)
- "payload" - Required data for a method \*

\* If the method doesn't require payload, it can be skipped

## Available methods

### GET_RANGE

Returns range in which the data is available.

```json
{
  "id": 1,
  "method": "get_range"
}
```

```json
{
  "id": 1,
  "response": {
    "min": "2002-01-02",
    "max": "2021-05-25"
  }
}
```

### GET_DISABLED_DAYS

Returns an array containing all dates that are not available in the specified month.

```json
{
  "id": 2,
  "method": "get_disabled_days",
  "payload": {
    "year": 2021,
    "month": 4
  }
}
```

```json
{
  "id": 2,
  "response": [
    "2021-04-03",
    "2021-04-04",
    "2021-04-05",
    "2021-04-10",
    "2021-04-11",
    "2021-04-17",
    "2021-04-18",
    "2021-04-24",
    "2021-04-25"
  ]
}
```

### GET_TABLE

Returns the NBP exchange rate table for the specified date.

```json
{
  "id": 3,
  "method": "get_table",
  "payload": "2021-05-25"
}
```

```json
{
  "id": 3,
  "response": {
    "table": "099/A/NBP/2021",
    "date": "2021-05-25",
    "rates": [
      {
        "code": "THB",
        "rate": 0.1166
      },
      {
        "code": "USD",
        "rate": 3.6549
      },
      {}
    ]
  }
}
```
