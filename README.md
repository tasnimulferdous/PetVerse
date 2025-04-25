# Meow: PetVerse 🐾

**PetVerse** is a web application designed for cat enthusiasts to explore various cat breeds, view images, and learn interesting facts about them. The project is structured with a React-based frontend and a Node.js/Express backend.

## Features

- Browse a curated list of cat breeds.
- View images and detailed information for each breed.
- Responsive design for optimal viewing on various devices.
- RESTful API integration for dynamic data fetching.

## Technologies Used

- **Frontend:** React, CSS
- **Backend:** Node.js, Express
- **Languages:** JavaScript, HTML, CSS

## Getting Started

Follow these instructions to set up and run the project locally.

### Prerequisites

Ensure you have the following installed:

- [Node.js](https://nodejs.org/) (v14 or later)
- [npm](https://www.npmjs.com/) (comes with Node.js)

### Installation

1. **Clone the repository:**

   ```bash
   git clone https://github.com/tasnimulferdous/Meow.git
   cd Meow
   ```

2. **Install dependencies for the server:**

   ```bash
   cd server
   npm install
   ```

3. **Install dependencies for the client:**

   ```bash
   cd ../client
   npm install
   ```

### Running the Application

1. **Start the backend server:**

   ```bash
   cd ../server
   npm start
   ```

2. **Start the frontend application:**

   Open a new terminal window:

   ```bash
   cd client
   npm start
   ```

The frontend will typically run on `http://localhost:3000`, and the backend API will run on `http://localhost:5000`.

## Project Structure

```
Meow/
├── client/         # React frontend application
├── server/         # Node.js/Express backend API
├── tmp.js          # Temporary or test script
└── README.md       # Project documentation
```

## Contributing

Contributions are welcome! If you'd like to contribute:

1. Fork the repository.
2. Create a new branch: `git checkout -b feature/your-feature-name`
3. Commit your changes: `git commit -m 'Add some feature'`
4. Push to the branch: `git push origin feature/your-feature-name`
5. Open a pull request.

Please ensure your code adheres to the project's coding standards and includes appropriate tests.

## License

This project is licensed under the [MIT License](LICENSE).
