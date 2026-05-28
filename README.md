# Customer Rewards Dashboard

A React JS application that calculates customer reward points from transactions over a three-month period.

## Features

* Reward point calculation logic
* Monthly rewards aggregation
* Total rewards aggregation
* Transactions table
* Search and filtering
* Loading, error, and empty states
* Reusable table components
* Pure utility functions
* Jest test coverage
* Tailwind CSS + shadcn/ui

---

## Reward Rules

* 2 points for every dollar spent over $100
* 1 point for every dollar spent between $50 and $100

### Example

* Purchase: `$120`
* Reward:

  * `2 x 20 = 40`
  * `1 x 50 = 50`
* Total = `90 points`

### Decimal Handling

* `100.2 -> 50 points`
* `100.4 -> 50 points`

---

## Tech Stack

* React JS
* Vite
* Tailwind CSS
* shadcn/ui
* Jest
* React Testing Library

---

## Project Structure

```bash
src/
  components/
    ui/
  data/
  services/
  lib/
  __tests__/
```

---

## Run Project

```bash
npm install
npm run dev
```

---

## Run Tests

```bash
npm test
```

---

## Build Project

```bash
npm run build
```

---

## Screenshots

### Dashboard

![Dashboard 1](/dashboard1.png)

### Dashboard with Filters

![Dashboard 2](/dashboard2.png)

### Test Cases

![Test Cases](/testcasestatus.png)

---

## Test Coverage

The project includes unit tests for:

* reward calculation logic
* monthly aggregation
* total aggregation
* transaction enrichment
* sorting logic
* dashboard loading state
* dashboard error state
* dashboard empty state
* successful dashboard rendering

---

## Notes

* No Redux used
* No TypeScript used
* Mock async API implemented
* Sorting handled through utility functions
* Data grouped by month and year
* Reusable table components used
* Pure functions used throughout the application
